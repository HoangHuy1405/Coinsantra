package com.web.TradeApp.feature.ingestion;

import com.azure.storage.queue.QueueClient;
import com.azure.storage.queue.models.QueueMessageItem;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.TradeApp.feature.aibot.enums.BotAction;
import com.web.TradeApp.feature.aibot.model.Bot;
import com.web.TradeApp.feature.aibot.model.BotSignal;
import com.web.TradeApp.feature.aibot.repository.BotRepository;
import com.web.TradeApp.feature.aibot.repository.BotSignalRepository;
import com.web.TradeApp.feature.ingestion.event.SignalReceivedEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

@Service
@Slf4j
@RequiredArgsConstructor
public class TradeQueueListener {

    private final BotRepository botRepository;
    private final BotSignalRepository botSignalRepository;
    private final ObjectMapper objectMapper;
    private final QueueClient queueClient;
    private final ApplicationEventPublisher eventPublisher;

    // Poll every 2 seconds
    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void processMessages() {
        try {
            // 1. RECEIVE: Get up to 5 messages at once
            // Visibility timeout: 30s (locks message so others don't process it)
            for (QueueMessageItem message : queueClient.receiveMessages(5, Duration.ofSeconds(30),
                    Duration.ofSeconds(5), null)) {
                handleSingleMessage(message);
            }
        } catch (Exception e) {
            // Log connection errors (e.g. internet down) but don't crash app
            log.error("Error polling Azure Queue: {}", e.getMessage());
        }
    }

    private void handleSingleMessage(QueueMessageItem message) {
        try {
            // Robust decoding: Handle both Plain JSON and Base64 encoded JSON
            String messageBody = getDecodedMessageBody(message);

            log.debug("Processing Message ID: {}", message.getMessageId());

            // 2. PARSE JSON
            // We parse your specific structure: { "webhookToken": "...", "payload": {
            // "secret_key": "..." } }
            JsonNode rootNode = objectMapper.readTree(messageBody);

            // 2.1 TIMESTAMP VALIDATION: Check if message is older than 5 minutes
            long receivedAt = rootNode.path("receivedAt").asLong(0);
            if (receivedAt > 0) {
                long currentTimeMillis = System.currentTimeMillis();
                long ageInMillis = currentTimeMillis - receivedAt;
                long fiveMinutesInMillis = 5 * 60 * 1000; // 5 minutes in milliseconds

                if (ageInMillis > fiveMinutesInMillis) {
                    log.warn("⏰ STALE MESSAGE: Message is {} minutes old. Discarding. Msg ID: {}",
                            ageInMillis / 60000, message.getMessageId());
                    deleteMessage(message); // Remove stale message
                    return;
                }
            } else {
                log.warn("⚠️ MISSING TIMESTAMP: receivedAt field not found. Msg ID: {}", message.getMessageId());
                // Continue processing if no timestamp (for backward compatibility)
            }

            // Extract Credentials
            String incomingToken = rootNode.path("webhookToken").asText(null);
            JsonNode payloadNode = rootNode.path("payload");
            String incomingSecret = payloadNode.path("secret_key").asText(null);

            // 2.2 ACTION VALIDATION: Check if action is ERROR
            String actionStr = payloadNode.path("action").asText("").toUpperCase();
            if ("ERROR".equals(actionStr)) {
                log.warn("⚠️ ERROR ACTION: Ignoring message with ERROR action. Msg ID: {}", message.getMessageId());
                deleteMessage(message); // Remove ERROR messages
                return;
            }

            // Validate action is LONG or SHORT
            if (!"LONG".equals(actionStr) && !"SHORT".equals(actionStr)) {
                log.warn("⚠️ INVALID ACTION: Unknown action '{}'. Expected LONG or SHORT. Msg ID: {}",
                        actionStr, message.getMessageId());
                deleteMessage(message); // Remove invalid action messages
                return;
            }

            // 3. VALIDATION
            if (incomingToken == null || incomingSecret == null) {
                log.warn("⚠️ MALFORMED: Missing token or secret. Msg ID: {}", message.getMessageId());
                deleteMessage(message); // Remove invalid garbage
                return;
            }

            // Find the Bot by Public Key (webhookToken)
            Bot bot = botRepository.findByApiKey(incomingToken).orElse(null);

            if (bot == null) {
                log.warn("⛔ UNKNOWN BOT: Token {}", incomingToken);
                deleteMessage(message); // Unknown user, remove it
                return;
            }

            // Secure Password Check (Prevents Timing Attacks)
            if (!isSecretValid(bot.getApiSecret(), incomingSecret)) {
                log.error("🚨 SECURITY: Invalid Secret for Bot: {}", bot.getName());
                deleteMessage(message); // Bad password, remove it
                return;
            }

            // 4. SUCCESS: SAVE TO DB
            saveBotSignal(bot, payloadNode, messageBody);

            // log.info("✅ Signal saved for Bot: {}", bot.getName());

            // 5. DELETE FROM QUEUE (Commit)
            deleteMessage(message);

        } catch (Exception e) {
            log.error("Failed to process message ID: " + message.getMessageId(), e);
            // Do NOT delete. Azure will make it visible again after 30s for retry.
            deleteMessage(message);
        }
    }

    /**
     * Safely extracts message body, handling Base64 if necessary.
     */
    private String getDecodedMessageBody(QueueMessageItem message) {
        String body = message.getBody().toString();

        // If it looks like JSON (starts with {), return as is.
        if (body.trim().startsWith("{")) {
            return body;
        }

        // Otherwise, try to decode from Base64
        try {
            byte[] decodedBytes = Base64.getDecoder().decode(body);
            String decodedString = new String(decodedBytes, StandardCharsets.UTF_8);
            // Sanity check: Does the decoded string look like JSON?
            if (decodedString.trim().startsWith("{")) {
                return decodedString;
            }
            return body; // Fallback to original if decoding didn't yield JSON
        } catch (IllegalArgumentException e) {
            // Not Base64, return original string (might fail JSON parsing later, but that's
            // handled)
            return body;
        }
    }

    private void saveBotSignal(Bot bot, JsonNode payload, String rawJson) {
        BotSignal signal = new BotSignal();
        signal.setBot(bot);

        // Map Data Fields
        signal.setCoinSymbol(payload.path("symbol").asText(bot.getCoinSymbol()));
        signal.setRawPayload(rawJson);

        // --- NEW MAPPING FOR PRICE AND CONFIDENCE ---
        if (payload.has("price")) {
            signal.setPrice(payload.get("price").asDouble());
        }

        if (payload.has("confidence")) {
            signal.setConfidence(payload.get("confidence").asDouble());
        }
        // --------------------------------------------

        // Handle Timestamp (Robust parsing)
        String timeStr = payload.path("timestamp").asText();
        try {
            if (timeStr != null && !timeStr.isEmpty()) {
                // Handle Python's format, ensuring it works with Java Instant
                if (!timeStr.endsWith("Z"))
                    timeStr += "Z";
                signal.setSignalTimestamp(Instant.parse(timeStr));
            } else {
                signal.setSignalTimestamp(Instant.now());
            }
        } catch (Exception e) {
            signal.setSignalTimestamp(Instant.now()); // Fallback
        }

        // Map Action (LONG -> BUY, SHORT -> SELL)
        String actionStr = payload.path("action").asText("").toUpperCase();
        if (actionStr.contains("LONG") || actionStr.contains("BUY")) {
            signal.setAction(BotAction.BUY);
        } else if (actionStr.contains("SHORT") || actionStr.contains("SELL")) {
            signal.setAction(BotAction.SELL);
        } else {
            // Default fallback if unknown
            signal.setAction(BotAction.BUY);
            signal.setErrorMessage("Unknown action: " + actionStr);
        }

        BotSignal savedSignal = botSignalRepository.save(signal);

        // log.info("✅ Signal saved. Publishing event for Bot: {}", bot.getName());
        eventPublisher.publishEvent(new SignalReceivedEvent(this, savedSignal));
    }

    /**
     * Secure Constant-Time Comparison.
     * Prevents hackers from guessing the key by measuring how long the CPU takes to
     * say "No".
     */
    private boolean isSecretValid(String storedSecret, String incomingSecret) {
        if (storedSecret == null || incomingSecret == null)
            return false;
        return MessageDigest.isEqual(storedSecret.getBytes(), incomingSecret.getBytes());
    }

    private void deleteMessage(QueueMessageItem message) {
        try {
            queueClient.deleteMessage(message.getMessageId(), message.getPopReceipt());
        } catch (Exception e) {
            log.warn("Failed to delete message (might already be deleted): {}", e.getMessage());
        }
    }
}