package com.web.TradeApp.service.interfaces;

import java.util.UUID;

import com.web.TradeApp.model.user.User;

public interface UserService {
    User fetchUserById(UUID id);

    User fetchUserByUsername(String username);

    User fetchUserByEmail(String email);

    void updateUserToken(String token, String email);

    User getUserByRefreshTokenAndEmail(String refresh_token, String email);
}
