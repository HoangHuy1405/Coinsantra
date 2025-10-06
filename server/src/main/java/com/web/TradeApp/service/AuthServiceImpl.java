package com.web.TradeApp.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Set;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.web.TradeApp.dto.AuthDTO.LoginRequest;
import com.web.TradeApp.dto.AuthDTO.LoginResponse;
import com.web.TradeApp.dto.AuthDTO.RegisterRequest;
import com.web.TradeApp.dto.AuthDTO.RegisterResponse;
import com.web.TradeApp.exception.UserNotFoundException;
import com.web.TradeApp.model.user.Role;
import com.web.TradeApp.model.user.Token;
import com.web.TradeApp.model.user.User;
import com.web.TradeApp.repository.TokenRepository;
import com.web.TradeApp.repository.UserRepository;
import com.web.TradeApp.service.interfaces.AuthService;
import com.web.TradeApp.service.interfaces.EmailService;
import com.web.TradeApp.service.interfaces.UserService;
import com.web.TradeApp.utils.JwtUtil;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;

@Service
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
        String hashPassword = passwordEncoder.encode(request.password());

        var user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .username(request.username())
                .email(request.email())
                .password(hashPassword)
                .phoneNum(request.phoneNum())
                .accountLocked(false)
                .enabled(false)
                .roles(Set.of(Role.TRADER))
                .build();

        userRepository.save(user);
        sendValidationEmail(user);

        return null;
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

    @Transactional
    @Override
    public void activateAccount(String token) throws MessagingException {
        Token savedToken = tokenRepository.findByToken(token)
                // todo exception has to be defined
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        if (Instant.now().isAfter(savedToken.getExpiresAt())) {
            // sendValidationEmail(savedToken.getUser());
            throw new RuntimeException(
                    "Activation token has Invalid/Expired!");
        }

        var user = userRepository.findById(savedToken.getUser().getId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        user.setEnabled(true);
        userRepository.save(user);

        savedToken.setValidatedAt(Instant.now());
        tokenRepository.save(savedToken);
    }

    private void sendValidationEmail(User user) {
        var newToken = generateAndSaveActivationToken(user);
        // send email
        emailService.sendConfirmationEmail(
                user.getEmail(),
                user.getFullName(),
                newToken,
                "Account activation");
    }

    private String generateAndSaveActivationToken(User user) {
        String generatedToken = generateActivationCode(6);
        var token = Token.builder()
                .token(generatedToken)
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

}
