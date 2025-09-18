package com.web.TradeApp.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.web.TradeApp.exception.UserNotFoundException;
import com.web.TradeApp.model.user.User;
import com.web.TradeApp.repository.UserRepository;
import com.web.TradeApp.service.interfaces.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

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
}
