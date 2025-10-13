package com.web.TradeApp.feature.user.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.TradeApp.feature.user.auth.constant.TokenType;
import com.web.TradeApp.feature.user.auth.entity.Token;
import com.web.TradeApp.feature.user.entity.User;

public interface TokenRepository extends JpaRepository<Token, UUID> {
    Optional<Token> findByTokenAndType(String token, TokenType type);

    Optional<Token> findByUserAndType(User user, TokenType type);

    void deleteAllByUser(User user);
}
