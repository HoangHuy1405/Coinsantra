package com.web.TradeApp.feature.common.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.TradeApp.feature.email.service.EmailService;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;

@RequestMapping("test")
@RestController
@RequiredArgsConstructor
public class TestController {
    private final EmailService emailService;

    @GetMapping("/send-email")
    public String sendTestEmail() throws MessagingException {
        emailService.sendConfirmationEmail(
                "nguyenmaihoanghuy@gmail.com", // recipient
                "Huy",
                "123456",
                "Confirm Your Account");
        return "Email sent!";
    }

    @GetMapping("/test-role")
    @PreAuthorize("hasAuthority('ADMIN')")
    public String testRole() {
        return "Only ADMIN can use this";
    }
}
