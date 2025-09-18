package com.web.TradeApp.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.web.TradeApp.service.interfaces.EmailService;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.springframework.mail.javamail.MimeMessageHelper.MULTIPART_MODE_MIXED;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

        private final JavaMailSender mailSender;

        @Async
        @Override
        public void sendConfirmationEmail(
                        String to,
                        String username,
                        String confirmationUrl,
                        String activationCode,
                        String subject) {
                try {
                        MimeMessage message = mailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(
                                        message,
                                        MULTIPART_MODE_MIXED,
                                        UTF_8.name());

                        helper.setFrom("your.email@gmail.com"); // or your app domain email
                        helper.setTo(to);
                        helper.setSubject(subject);

                        // Plain text fallback
                        String textContent = """
                                        Hello %s,

                                        Please confirm your account by visiting the link below:
                                        %s

                                        Or use this activation code: %s
                                        """.formatted(username, confirmationUrl, activationCode);

                        // Simple HTML version
                        String htmlContent = """
                                        <html>
                                        <body>
                                            <h2>Hello %s,</h2>
                                            <p>Thank you for registering. Please confirm your account by clicking the link below:</p>
                                            <p><a href="%s" style="color: #1a73e8;">Confirm Account</a></p>
                                            <p>Or use this activation code: <b>%s</b></p>
                                            <hr>
                                            <small>This link will expire soon. If you did not request this, you can ignore this email.</small>
                                        </body>
                                        </html>
                                        """
                                        .formatted(username, confirmationUrl, activationCode);

                        helper.setText(textContent, htmlContent); // sets both plain and HTML

                        mailSender.send(message);
                        log.info("Confirmation email sent to {}", to);

                } catch (MessagingException e) {
                        log.error("Failed to send confirmation email to {}: {}", to, e.getMessage());
                        throw new RuntimeException("Failed to send confirmation email", e);
                }
        }
}
