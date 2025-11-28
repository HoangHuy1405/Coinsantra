package com.web.TradeApp.feature.aibot.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.web.TradeApp.feature.aibot.model.Bot;

@Repository
public interface BotRepository extends JpaRepository<Bot, UUID>, JpaSpecificationExecutor<Bot> {
    Optional<Bot> findByApiKey(String apiKey);
}
