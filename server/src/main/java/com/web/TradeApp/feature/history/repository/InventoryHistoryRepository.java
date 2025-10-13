package com.web.TradeApp.feature.history.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.TradeApp.feature.history.entity.InventoryHistory;

public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, UUID> {
}
