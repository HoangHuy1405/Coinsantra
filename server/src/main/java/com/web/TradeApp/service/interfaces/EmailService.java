package com.web.TradeApp.service.interfaces;

import com.web.TradeApp.model.email.EmailDetails;

public interface EmailService {
    void sendConfirmationEmail(
            String to,
            String username,
            String activationCode,
            String subject);

    String sendSimpleMail(EmailDetails details);

    String sendMailWithAttachment(EmailDetails details);
}
