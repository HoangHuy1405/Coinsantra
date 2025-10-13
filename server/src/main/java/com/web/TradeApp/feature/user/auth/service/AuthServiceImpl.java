package com.web.TradeApp.feature.user.auth.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.web.TradeApp.exception.ConflictException;
import com.web.TradeApp.exception.InvalidTokenException;
import com.web.TradeApp.exception.UserNotFoundException;
import com.web.TradeApp.feature.email.service.EmailService;
import com.web.TradeApp.feature.user.auth.constant.AuthProvider;
import com.web.TradeApp.feature.user.auth.constant.Role;
import com.web.TradeApp.feature.user.auth.constant.TokenType;
import com.web.TradeApp.feature.user.auth.dto.LoginRequest;
import com.web.TradeApp.feature.user.auth.dto.LoginResponse;
import com.web.TradeApp.feature.user.auth.dto.RegisterRequest;
import com.web.TradeApp.feature.user.auth.dto.RegisterResponse;
import com.web.TradeApp.feature.user.auth.entity.Token;
import com.web.TradeApp.feature.user.auth.repository.TokenRepository;
import com.web.TradeApp.feature.user.entity.User;
import com.web.TradeApp.feature.user.repository.UserRepository;
import com.web.TradeApp.feature.user.service.UserService;
import com.web.TradeApp.utils.JwtUtil;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final EmailService emailService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Override
    public RegisterResponse register(RegisterRequest request) {
        // Check if a user already exists with this email
        var optUser = userRepository.findByEmail(request.email());
        String hashPassword = passwordEncoder.encode(request.password());
        User user = null;
        if (optUser.isPresent()) {
            user = optUser.get();
            if (user.isEnabled()) {
                throw new ConflictException("Email already taken. Please try another one");
            }
            user.getTokens().clear();

            // override old value
            user.setUsername(request.username());
            user.setPassword(hashPassword);
            user.setAccountLocked(false);
            user.setEnabled(false);
            user.setAuthProvider(AuthProvider.CREDENTIALS);
            user.setRoles(new HashSet<>(List.of(Role.TRADER)));

        } else {
            user = User.builder()
                    .username(request.username())
                    .email(request.email())
                    .password(hashPassword)
                    .accountLocked(false)
                    .enabled(false)
                    .roles(Set.of(Role.TRADER))
                    .authProvider(AuthProvider.CREDENTIALS)
                    .build();
        }
        User createdUser = userRepository.save(user);
        String urlToken = generateAndSaveUrlToken(createdUser);
        sendValidationEmail(createdUser, urlToken);

        return RegisterResponse.builder()
                .id(createdUser.getId())
                .email(createdUser.getEmail())
                .createdAt(createdUser.getCreatedAt())
                .urlToken(urlToken)
                .build();
    }

    @Transactional
    @Override
    public void activateAccount(String codeRequest, String urlTokenRequest) throws MessagingException {
        // verify Token url
        Token urlToken = tokenRepository.findByTokenAndType(urlTokenRequest, TokenType.TOKEN_URL)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired verification link"));
        if (urlToken.isUsed() || Instant.now().isAfter(urlToken.getExpiresAt())) {
            throw new InvalidTokenException("Verification link expired or already used");
        }
        User user = urlToken.getUser();

        // verify 6-digit code
        Token activateCode = tokenRepository.findByUserAndType(user, TokenType.ACTIVATE_CODE)
                .orElseThrow(() -> new InvalidTokenException("Invalid code or expired"));
        if (activateCode.isUsed() || Instant.now().isAfter(activateCode.getExpiresAt())) {
            throw new InvalidTokenException("Activation code expired or already used");
        }
        if (!activateCode.getToken().equals(codeRequest)) {
            throw new InvalidTokenException("Invalid verification code");
        }

        user.setEnabled(true);
        userRepository.save(user);

        urlToken.setValidatedAt(Instant.now());
        urlToken.setUsed(true);

        activateCode.setValidatedAt(Instant.now());
        activateCode.setUsed(true);
        tokenRepository.saveAll(List.of(urlToken, activateCode));
    }

    private void sendValidationEmail(User user, String urlToken) {
        var newToken = generateAndSaveActivationToken(user);
        // send email
        emailService.sendConfirmationEmail(
                user.getEmail(),
                user.getUsername(),
                newToken,
                "Account activation");

    }

    private String generateAndSaveActivationToken(User user) {
        String generatedToken = generateActivationCode(6);
        var token = Token.builder()
                .token(generatedToken)
                .type(TokenType.ACTIVATE_CODE)
                .used(false)
                .expiresAt(Instant.now().plusSeconds(900)) // 15 min
                .user(user)
                .build();
        tokenRepository.save(token);
        return generatedToken;
    }

    private String generateActivationCode(int length) {
        String characters = "0123456789";
        StringBuilder stringBuilder = new StringBuilder();
        SecureRandom secureRandom = new SecureRandom();

        for (int i = 0; i < length; i++) {
            int randomIndex = secureRandom.nextInt(characters.length());
            stringBuilder.append(characters.charAt(randomIndex));
        }
        return stringBuilder.toString();
    }

    private String generateAndSaveUrlToken(User user) {
        String urlTokenString = UUID.randomUUID().toString();
        Token token = Token.builder()
                .type(TokenType.TOKEN_URL)
                .token(urlTokenString)
                .user(user)
                .expiresAt(Instant.now().plus(15, ChronoUnit.MINUTES))
                .used(false)
                .build();
        tokenRepository.save(token);
        return urlTokenString;
    }

    public LoginResponse createLoginRes(User user, String email) {
        LoginResponse res = new LoginResponse();

        // Extract role names
        List<String> roleNames = user.getRoles()
                .stream()
                .map(Enum::name) // convert Role enum to string (TRADER, ADMIN, etc.)
                .toList();

        // extract user roles
        // extract role names from user entity

        LoginResponse.UserLogin userLogin = new LoginResponse.UserLogin(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getFullName(),
                user.getProfilePhotoUrl(),
                roleNames);

        res.setUser(userLogin);

        // create a token
        String access_token = this.jwtUtil.generateAccessToken(email, res, roleNames);
        res.setAccessToken(access_token);

        return res;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // Nạp input gồm username/password vào Security
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                request.email(),
                request.password());

        // xác thực người dùng => cần viết hàm loadUserByUsername trong
        // UserDetailsService
        Authentication authentication = authenticationManagerBuilder.getObject()
                .authenticate(authToken);

        // set thông tin người dùng đăng nhập vào context (for others to use)
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User currentUser = this.userService.fetchUserByEmail(request.email());
        if (currentUser == null)
            throw new UserNotFoundException("User not found");

        return createLoginRes(currentUser, request.email());
    }

}
