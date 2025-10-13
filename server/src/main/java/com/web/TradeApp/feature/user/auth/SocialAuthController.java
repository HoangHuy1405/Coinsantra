package com.web.TradeApp.feature.user.auth;

import java.io.IOException;
import java.security.GeneralSecurityException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.TradeApp.feature.common.Annotation.ApiMessage;
import com.web.TradeApp.feature.user.auth.dto.GoogleLoginRequest;
import com.web.TradeApp.feature.user.auth.dto.LoginResponse;
import com.web.TradeApp.feature.user.auth.service.SocialAuthService;
import com.web.TradeApp.feature.user.service.UserService;
import com.web.TradeApp.utils.JwtUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("auth/social")
@RequiredArgsConstructor
public class SocialAuthController {
        private final SocialAuthService authService;
        private final JwtUtil jwtUtil;
        private final UserService userService;

        @Value("${application.security.jwt.refresh-expiration}")
        private long refreshTokenExpiration;

        @PostMapping("/google")
        @ApiMessage("Login Google successfully")
        public ResponseEntity<LoginResponse> loginGoogle(@RequestBody GoogleLoginRequest request)
                        throws GeneralSecurityException, IOException {
                LoginResponse response = authService.loginGoogle(request);

                // generate refresh_token
                String refresh_token = this.jwtUtil.generateRefreshToken(response.getUser().getEmail(), response);
                this.userService.updateUserToken(refresh_token, response.getUser().getEmail());

                // Set cookies
                ResponseCookie resCookie = ResponseCookie
                                .from("refresh_token", refresh_token)
                                .httpOnly(true)
                                .secure(true)
                                .path("/")
                                .maxAge(refreshTokenExpiration)
                                .build();
                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, resCookie.toString())
                                .body(response);
        }
}
