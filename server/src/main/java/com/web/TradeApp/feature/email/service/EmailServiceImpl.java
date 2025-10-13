package com.web.TradeApp.feature.email.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.web.TradeApp.feature.email.entity.EmailDetails;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.springframework.mail.javamail.MimeMessageHelper.MULTIPART_MODE_MIXED;

import org.springframework.beans.factory.annotation.Value;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

        private final JavaMailSender mailSender;

        @Value("${spring.mail.username}")
        private String sender;

        @Async
        @Override
        public void sendConfirmationEmail(
                        String to,
                        String username,
                        String activationCode,
                        String subject) {
                try {
                        MimeMessage message = mailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(
                                        message,
                                        MULTIPART_MODE_MIXED,
                                        UTF_8.name());

                        helper.setFrom(sender); // replace with your app domain email
                        helper.setTo(to);
                        helper.setSubject(subject);

                        // Plain text fallback
                        String textContent = """
                                        Hello %s,

                                        Thank you for registering. Please use the confirmation code below to activate your account:

                                        %s

                                        This code will expire soon. If you did not request this, you can ignore this email.
                                        """
                                        .formatted(username, activationCode);

                        // HTML version
                        String htmlContent = """
                                        <html>
                                        <body>
                                            <h2>Hello %s,</h2>
                                            <p>Thank you for registering. Please use the confirmation code below to activate your account:</p>
                                            <h3 style="color: #1a73e8;">%s</h3>
                                            <hr>
                                            <small>This code will expire soon. If you did not request this, you can ignore this email.</small>
                                        </body>
                                        </html>
                                        """
                                        .formatted(username, activationCode);

                        helper.setText(textContent, htmlContent); // sets both plain and HTML

                        mailSender.send(message);
                        log.info("Confirmation email sent to {}", to);

                } catch (MessagingException e) {
                        log.error("Failed to send confirmation email to {}: {}", to, e.getMessage());
                        throw new RuntimeException("Failed to send confirmation email", e);
                }
        }

        @Override
        public String sendSimpleMail(EmailDetails details) {
                try {

                        // Creating a simple mail message
                        SimpleMailMessage mailMessage = new SimpleMailMessage();

                        // Setting up necessary details
                        mailMessage.setFrom(sender);
                        mailMessage.setTo(details.getRecipient());
                        mailMessage.setText(details.getMsgBody());
                        mailMessage.setSubject(details.getSubject());

                        // Sending the mail
                        mailSender.send(mailMessage);
                        return "Mail Sent Successfully...";
                } catch (MailException mailEx) {
                        // Specific Spring exception for mail errors
                        log.error("Mail sending failed: {}", mailEx.getMessage(), mailEx);
                        return "Failed to send mail: " + mailEx.getMessage();
                } catch (Exception ex) {
                        // Catch-all for unexpected exceptions
                        log.error("Unexpected error while sending mail", ex);
                        return "Unexpected error while sending mail. Please try again later.";
                }
        }

        @Override
        public String sendMailWithAttachment(EmailDetails details) {
                // TODO Auto-generated method stub
                throw new UnsupportedOperationException("Unimplemented method 'sendMailWithAttachment'");
        }
}
