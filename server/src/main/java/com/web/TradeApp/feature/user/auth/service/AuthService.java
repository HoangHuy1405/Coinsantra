package com.web.TradeApp.feature.user.auth.service;

import com.web.TradeApp.feature.user.auth.dto.LoginRequest;
import com.web.TradeApp.feature.user.auth.dto.LoginResponse;
import com.web.TradeApp.feature.user.auth.dto.RegisterRequest;
import com.web.TradeApp.feature.user.auth.dto.RegisterResponse;
import com.web.TradeApp.feature.user.entity.User;

import jakarta.mail.MessagingException;

public interface AuthService {
    RegisterResponse register(RegisterRequest request);

    void activateAccount(String codeRequest, String urlTokenRequest) throws MessagingException;

    LoginResponse login(LoginRequest request);

    LoginResponse createLoginRes(User user, String email);
}
