package com.web.TradeApp.feature.coin.service;

public interface WalletSnapshotService {
    /**
     * Captures snapshots of all user wallets in batches
     */
    void captureWallets();
}
