package com.web.TradeApp.feature.aibot.dto;

import java.util.UUID;

public record BotSecretResponse(
                UUID botId,
                String name,
                String webhookToken,
                String apiSecret, // Optional: if you use HMAC signing
                String webhookUrl // The link the Admin must copy to Python
) {
}
