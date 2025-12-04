package com.web.TradeApp.feature.admin.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.web.TradeApp.config.seeder.DataSeeder;
import com.web.TradeApp.feature.coin.entity.Wallet;
import com.web.TradeApp.feature.coin.repository.WalletRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final WalletRepository walletRepo;

    private UUID cachedAdminWalletId;
    private static final String ADMIN_USERNAME = DataSeeder.uniqueAdminUsername;

    @Override
    public Wallet getAdminWallet() {
        if (cachedAdminWalletId == null) {
            // Fallback if @PostConstruct failed or ran before seeder
            return walletRepo.findByUser_Username(ADMIN_USERNAME)
                    .orElseThrow(() -> new RuntimeException(
                            "CRITICAL: System Admin Wallet not found. Check DataSeeder."));
        }
        return walletRepo.findById(cachedAdminWalletId)
                .orElseThrow(() -> new RuntimeException(
                        "CRITICAL: Cached Admin Wallet ID is invalid."));
    }
}
