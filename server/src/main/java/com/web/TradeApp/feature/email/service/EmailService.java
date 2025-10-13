package com.web.TradeApp.feature.email.service;

import com.web.TradeApp.feature.email.entity.EmailDetails;

public interface EmailService {
    void sendConfirmationEmail(
            String to,
            String username,
            String activationCode,
            String subject);

    String sendSimpleMail(EmailDetails details);

    String sendMailWithAttachment(EmailDetails details);
}
