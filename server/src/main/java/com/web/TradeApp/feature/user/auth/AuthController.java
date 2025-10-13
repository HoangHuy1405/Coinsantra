package com.web.TradeApp.feature.user.auth;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.beans.factory.annotation.Value;

import com.web.TradeApp.exception.UserNotFoundException;
import com.web.TradeApp.feature.common.Annotation.ApiMessage;
import com.web.TradeApp.feature.user.auth.dto.LoginRequest;
import com.web.TradeApp.feature.user.auth.dto.LoginResponse;
import com.web.TradeApp.feature.user.auth.dto.RegisterRequest;
import com.web.TradeApp.feature.user.auth.dto.RegisterResponse;
import com.web.TradeApp.feature.user.auth.dto.TokenRequest;
import com.web.TradeApp.feature.user.auth.service.AuthService;
import com.web.TradeApp.feature.user.entity.User;
import com.web.TradeApp.feature.user.service.UserService;
import com.web.TradeApp.utils.JwtUtil;
import com.web.TradeApp.utils.SecurityUtil;

import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
public class AuthController {
        private final AuthService authService;
        private final JwtUtil jwtUtil;
        private final UserService userService;
        private final SecurityUtil securityUtil;

        @Value("${application.security.jwt.refresh-expiration}")
        private long refreshTokenExpiration;

        @PostMapping("/register")
        @ApiMessage("User registered successfully")
        public ResponseEntity<RegisterResponse> register(
                        @RequestBody @Valid RegisterRequest request) {
                RegisterResponse response = authService.register(request);
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }

        @PostMapping("/activate")
        @ApiMessage("Account activate successfully")
        public ResponseEntity<Void> confirm(@RequestBody TokenRequest request) throws MessagingException {
                authService.activateAccount(request.getActivateCode(), request.getUrlToken());
                return ResponseEntity.ok().body(null);
        }

        @PostMapping("/login")
        @ApiMessage("login successfully")
        public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
                LoginResponse response = authService.login(request);

                // generate refresh_token
                String refresh_token = this.jwtUtil.generateRefreshToken(request.email(), response);
                this.userService.updateUserToken(refresh_token, request.email());

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

        @PostMapping("/refresh")
        @ApiMessage("Get refresh_token")
        public ResponseEntity<LoginResponse> getRefreshToken(
                        @CookieValue(name = "refresh_token") String refreshToken) {
                /**
                 * Exception 1: refresh_token may be null (not found)
                 * Exception 2: refresh_token and email may not found/match in database
                 * (invalid)
                 */
                // Check valid
                Jwt decodedToken = this.securityUtil.checkValidRefreshToken(refreshToken);
                String email = decodedToken.getSubject();

                // Check token, email if exists in db
                // (refresh may exist only in cookie prior)
                User currentUser = this.userService.getUserByRefreshTokenAndEmail(refreshToken, email);
                if (currentUser == null)
                        throw new UserNotFoundException("User not found");

                // create response
                LoginResponse response = authService.createLoginRes(currentUser, email);

                // create new refresh token
                String new_refresh_token = this.jwtUtil.generateRefreshToken(email, response);
                // update user in db (override old one)
                this.userService.updateUserToken(new_refresh_token, email);

                ResponseCookie resCookie = ResponseCookie
                                .from("refresh_token",
                                                new_refresh_token)
                                .httpOnly(true)
                                .secure(true)
                                .path("/")
                                .maxAge(refreshTokenExpiration)
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, resCookie.toString())
                                .body(response);
        }

        @PostMapping("/logout")
        @ApiMessage("Logout successfully")
        public ResponseEntity<Void> logout() {
                String email = SecurityUtil.getCurrentUserLogin().isPresent()
                                ? SecurityUtil.getCurrentUserLogin().get()
                                : "";

                if (email.equals("")) {
                        throw new AuthenticationCredentialsNotFoundException("No authenticated user found");
                }
                // update refresh token in db = null
                this.userService.updateUserToken(null, email);

                // remove refresh token in cookie
                ResponseCookie deleteCookie = ResponseCookie
                                .from("refresh_token", "")
                                .httpOnly(true)
                                .secure(true)
                                .path("/")
                                .maxAge(0)
                                .build();

                return ResponseEntity
                                .ok()
                                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                                .body(null);

        }

}
