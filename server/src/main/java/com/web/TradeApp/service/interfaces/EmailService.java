package com.web.TradeApp.service.interfaces;

public interface EmailService {
    void sendConfirmationEmail(
            String to,
            String username,
            String confirmationUrl,
            String activationCode,
            String subject);
}
