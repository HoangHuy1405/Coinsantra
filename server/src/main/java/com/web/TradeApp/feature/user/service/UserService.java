package com.web.TradeApp.feature.user.service;

import java.util.UUID;

import com.web.TradeApp.feature.user.dto.ChangePasswordRequest;
import com.web.TradeApp.feature.user.entity.User;

public interface UserService {
    User fetchUserById(UUID id);

    User fetchUserByUsername(String username);

    User fetchUserByEmail(String email);

    void updateUserToken(String token, String email);

    User getUserByRefreshTokenAndEmail(String refresh_token, String email);

    void changePassword(ChangePasswordRequest request);
}
