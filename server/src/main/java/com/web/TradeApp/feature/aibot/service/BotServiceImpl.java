package com.web.TradeApp.feature.aibot.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.web.TradeApp.exception.IdInvalidException;
import com.web.TradeApp.feature.aibot.dto.BotCreateRequest;
import com.web.TradeApp.feature.aibot.dto.BotResponse;
import com.web.TradeApp.feature.aibot.dto.BotSecretResponse;
import com.web.TradeApp.feature.aibot.mapper.BotMapper;
import com.web.TradeApp.feature.aibot.model.Bot;
import com.web.TradeApp.feature.aibot.repository.BotRepository;
import com.web.TradeApp.feature.aibot.repository.BotSubscriptionRepository;
import com.web.TradeApp.utils.SecurityUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BotServiceImpl implements BotService {
    private final BotRepository botRepository;
    private final BotSubscriptionRepository botSubscriptionRepository;
    private final BotMapper botMapper;
    private final SecurityUtil securityUtil;

    // 1. Inject the value from YAML
    // If it's missing, it defaults to http://localhost:8080
    @Value("${application.webhook-url:http://localhost:8080}")
    private String baseUrl;

    @Override
    public BotSecretResponse createBot(BotCreateRequest request) {
        // 1. Map Request to Entity
        Bot bot = botMapper.toEntity(request);

        // 2. GENERATE KEYS (The Security Part)
        String generatedWebHookToken = securityUtil.generateSecureString(32); // e.g., "bk_7f8a9d..."
        String generatedApiSecret = securityUtil.generateSecureString(64); // e.g., "sec_9a8f..."

        bot.setApiSecret(generatedApiSecret);
        bot.setApiKey(generatedWebHookToken);

        // 3. Save to DB
        Bot savedBot = botRepository.save(bot);

        // 4. Construct the Webhook URL
        // This is the address the Python bot needs to send data TO
        String webhookUrl = String.format("%s/%s", baseUrl, generatedWebHookToken);

        // 5. Update the Bot entity with the final webhook URL and re-save
        // We store the webhook URL for auditing/reference, even though it's derivable.
        savedBot.setApiUrl(webhookUrl);
        botRepository.save(savedBot);

        // 6. Return the credentials and webhook URL to the admin panel
        return new BotSecretResponse(
                savedBot.getId(),
                savedBot.getName(),
                generatedWebHookToken,
                generatedApiSecret,
                webhookUrl);
    }

    @Override
    @Transactional(readOnly = true)
    public BotResponse getBotForEdit(UUID botId, boolean includeStats) {
        Bot bot = botRepository.findById(botId)
                .orElseThrow(() -> new IdInvalidException("Bot not found: " + botId));

        BotResponse.BotStats stats = includeStats ? calculateStats(bot) : null;

        return botMapper.toResponse(bot, stats);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BotResponse> getAllBots(boolean includeStats) {
        List<Bot> bots = botRepository.findAll();

        return bots.stream()
                .map(bot -> {
                    BotResponse.BotStats stats = includeStats ? calculateStats(bot) : null;
                    return botMapper.toResponse(bot, stats);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BotResponse updateBot(UUID botId, BotCreateRequest request) {
        Bot bot = botRepository.findById(botId)
                .orElseThrow(() -> new IdInvalidException("Bot not found with ID: " + botId));

        // Update fields using MapStruct
        botMapper.updateEntity(bot, request);
        Bot updatedBot = botRepository.save(bot);

        return botMapper.toResponse(updatedBot, null);
    }

    @Override
    @Transactional
    public void deleteBot(UUID botId) {
        if (!botRepository.existsById(botId)) {
            throw new RuntimeException("Bot not found with ID: " + botId);
        }
        // Must have strict foreign key constraints in DB,
        // ensure they are set to ON DELETE CASCADE, (delete others bot table as well)
        // if it not works, manually delete related entities
        botRepository.deleteById(botId);
    }

    @Override
    public BotResponse.BotStats calculateStats(Bot bot) {
        Long subscriberCount = botSubscriptionRepository.countByBotIdAndActiveTrue(bot.getId());

        // Mocking trade count/ROI for now as per previous context
        // You can replace these with actual Repository calls
        Long tradeCount = 0L; // botTradeRepository.countByBotId(bot.getId());
        Double uptime = 99.9;
        Double roi = 0.0;
        Double pnl = 0.0;

        return new BotResponse.BotStats(
                tradeCount,
                uptime,
                subscriberCount,
                roi,
                pnl,
                bot.getLastSignalAt() // Map lastSignalAt from Entity to Stats
        );
    }
}
