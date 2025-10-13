package com.web.TradeApp.feature.user.auth.service;

import java.io.IOException;
import java.security.GeneralSecurityException;

import com.web.TradeApp.feature.user.auth.dto.GoogleLoginRequest;
import com.web.TradeApp.feature.user.auth.dto.LoginResponse;

public interface SocialAuthService {
    LoginResponse loginGoogle(GoogleLoginRequest request) throws GeneralSecurityException, IOException;
}
