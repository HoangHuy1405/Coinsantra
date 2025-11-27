package com.web.TradeApp.feature.aibot.service;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.web.TradeApp.feature.aibot.model.Bot;
import com.web.TradeApp.feature.common.response.ResultPaginationResponse;

public interface BotUserService {
    ResultPaginationResponse getAllBotsForUser(Specification<Bot> spec, Pageable pageable);
}
