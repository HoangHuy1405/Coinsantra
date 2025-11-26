// package com.web.TradeApp.feature.aibot.service;

// import com.web.TradeApp.feature.aibot.enums.SignalStatus;
// import com.web.TradeApp.feature.aibot.model.BotSignal;
// import com.web.TradeApp.feature.aibot.repository.BotSignalRepository;
// import com.web.TradeApp.feature.ingestion.event.SignalReceivedEvent;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.context.event.EventListener;
// import org.springframework.scheduling.annotation.Async;
// import org.springframework.scheduling.annotation.Scheduled;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.time.Instant;
// import java.time.temporal.ChronoUnit;

// @Service
// @Slf4j
// @RequiredArgsConstructor
// public class TradeExecutionService {

// private final BotSignalRepository botSignalRepository;

// private static final long SIGNAL_TOLERANCE_SECONDS = 60;
// private static final long SIGNAL_RETENTION_MINUTES = 15;

// @Async
// @EventListener
// public void onSignalReceived(SignalReceivedEvent event) {
// BotSignal signal = event.getSignal();
// log.info("🔔 Found bot signal ID: {} - Analyzing for Bot: {}",
// signal.getId(), signal.getBot().getName());
// // analyzeAndExecute(signal);
// }

// @Transactional
// public void analyzeAndExecute(BotSignal signal) {
// signal = botSignalRepository.findById(signal.getId()).orElse(signal);

// if (signal.getStatus() != SignalStatus.PENDING) {
// return;
// }

// try {
// signal.setStatus(SignalStatus.PROCESSING);
// botSignalRepository.saveAndFlush(signal);

// Instant now = Instant.now();
// long age = ChronoUnit.SECONDS.between(signal.getSignalTimestamp(), now);

// if (age > SIGNAL_TOLERANCE_SECONDS) {
// log.warn("⚠️ Signal EXPIRED: ID={} Age={}s > Limit={}s", signal.getId(), age,
// SIGNAL_TOLERANCE_SECONDS);
// signal.setStatus(SignalStatus.EXPIRED);
// signal.setErrorMessage("Signal too old: " + age + "s latency");
// signal.setProcessedAt(now);
// botSignalRepository.save(signal);
// return;
// }

// // EXECUTE TRADE LOGIC HERE
// log.info("🚀 Executing Trade: {} {} @ ${} (Confidence: {}%)",
// signal.getAction(), signal.getCoinSymbol(), signal.getPrice(),
// signal.getConfidence());

// signal.setStatus(SignalStatus.EXECUTED);
// signal.setProcessedAt(now);
// botSignalRepository.save(signal);

// } catch (Exception e) {
// log.error("❌ Execution Failed for Signal ID: " + signal.getId(), e);
// signal.setStatus(SignalStatus.FAILED);
// signal.setErrorMessage(e.getMessage());
// signal.setProcessedAt(Instant.now());
// botSignalRepository.save(signal);
// }
// }

// // clean up (delete) old signals that are useless (less than 15 min)
// @Scheduled(fixedRate = 300000)
// @Transactional
// public void cleanupOldSignals() {
// Instant cutoff = Instant.now().minus(SIGNAL_RETENTION_MINUTES,
// ChronoUnit.MINUTES);
// int deleted = botSignalRepository.deleteBySignalTimestampBefore(cutoff);
// if (deleted > 0) {
// log.info("🧹 Cleanup: Removed {} old signals", deleted);
// }
// }
// }
