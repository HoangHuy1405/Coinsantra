package com.web.TradeApp.feature.aibot.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.web.TradeApp.exception.InvalidFilterValueException;
import com.web.TradeApp.feature.aibot.dto.BotResponse;
import com.web.TradeApp.feature.aibot.mapper.BotMapper;
import com.web.TradeApp.feature.aibot.model.Bot;
import com.web.TradeApp.feature.aibot.repository.BotRepository;
import com.web.TradeApp.feature.common.response.ResultPaginationResponse;
import com.web.TradeApp.feature.common.response.ResultPaginationResponse.PageMeta;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BotUserServiceImpl implements BotUserService {
    private final BotRepository botRepo;
    private final BotMapper botMapper;
    private final BotService botService;

    @Override
    public ResultPaginationResponse getAllBotsForUser(Specification<Bot> spec, Pageable pageable) {
        Page<Bot> pageBots;
        try {
            pageBots = this.botRepo.findAll(spec, pageable);
        } catch (Exception e) {
            throw new InvalidFilterValueException("Invalid filter value provided", e);
        }
        ResultPaginationResponse res = new ResultPaginationResponse();
        PageMeta meta = new PageMeta();

        meta.setPage(pageable.getPageNumber());
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(pageBots.getTotalPages());
        meta.setTotal(pageBots.getTotalElements());

        res.setMeta(meta);
        List<BotResponse> listBot = pageBots.getContent().stream()
                .map(bot -> {
                    BotResponse.BotStats stats = botService.calculateStats(bot);
                    return botMapper.toResponse(bot, stats);
                })
                .toList();
        res.setResult(listBot);
        return res;
    }
}
