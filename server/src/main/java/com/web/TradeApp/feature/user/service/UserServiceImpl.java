package com.web.TradeApp.feature.user.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.web.TradeApp.exception.FunctionErrorException;
import com.web.TradeApp.exception.UserNotFoundException;
import com.web.TradeApp.feature.user.dto.ChangePasswordRequest;
import com.web.TradeApp.feature.user.entity.User;
import com.web.TradeApp.feature.user.repository.UserRepository;
import com.web.TradeApp.utils.SecurityUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User fetchUserById(UUID id) {
        Optional<User> userOptional = this.userRepository.findById(id);
        return userOptional.orElse(null);
    }

    @Override
    public User fetchUserByUsername(String username) {
        Optional<User> userOptional = this.userRepository.findByUsername(username);
        return userOptional.orElse(null);
    }

    @Override
    public User fetchUserByEmail(String email) {
        Optional<User> userOptional = this.userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new UserNotFoundException(
                    String.format("User cannot be found with email: %s", email));
        }
        return userOptional.get();
    }

    @Override
    public void updateUserToken(String token, String email) {
        User currentUser = this.fetchUserByEmail(email);
        if (currentUser != null) {
            currentUser.setRefreshToken(token);
            this.userRepository.save(currentUser);
        }
    }

    @Override
    public User getUserByRefreshTokenAndEmail(String refresh_token, String email) {
        Optional<User> optUser = this.userRepository.findByRefreshTokenAndEmail(refresh_token, email);
        if (optUser.isEmpty()) {
            throw new UserNotFoundException(
                    String.format("User with email %s and refresh token not found", email));
        }
        return optUser.get();
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        UUID userId = SecurityUtil.getCurrentUserId().orElse(null);
        Optional<User> optUser = (userId != null)
                ? this.userRepository.findById(userId)
                : Optional.empty();
        if (optUser.isEmpty()) {
            throw new UserNotFoundException("Invalid User ID");
        }
        User user = optUser.get();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new FunctionErrorException("Wrong password");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new FunctionErrorException("New password must not equal to old password!");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }
}
