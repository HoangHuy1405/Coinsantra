package com.web.TradeApp.service.interfaces;

import com.web.TradeApp.dto.AuthDTO.LoginRequest;
import com.web.TradeApp.dto.AuthDTO.LoginResponse;
import com.web.TradeApp.dto.AuthDTO.RegisterRequest;
import com.web.TradeApp.dto.AuthDTO.RegisterResponse;
import com.web.TradeApp.model.user.User;

public interface AuthService {
    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    LoginResponse createLoginRes(User user, String email);
}
