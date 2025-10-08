package com.web.TradeApp.service.interfaces;

import java.io.IOException;
import java.security.GeneralSecurityException;

import com.web.TradeApp.dto.AuthDTO.GoogleLoginRequest;
import com.web.TradeApp.dto.AuthDTO.LoginResponse;

public interface SocialAuthService {
    LoginResponse loginGoogle(GoogleLoginRequest request) throws GeneralSecurityException, IOException;
}
