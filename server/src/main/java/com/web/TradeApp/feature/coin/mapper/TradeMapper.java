package com.web.TradeApp.feature.coin.mapper;

import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import com.web.TradeApp.feature.coin.dto.TradeResponse;
import com.web.TradeApp.feature.coin.entity.Transaction;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE, builder = @Builder(disableBuilder = true))
public interface TradeMapper {

    @Mapping(target = "transactionId", source = "id")
    @Mapping(target = "tradeType", expression = "java(transaction.getType().name())")
    @Mapping(target = "coinSymbol", source = "coin.symbol")
    @Mapping(target = "coinName", source = "coin.name")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "priceAtExecution", source = "priceAtExecution")
    @Mapping(target = "notionalValue", source = "notionalValue")
    @Mapping(target = "feeApplied", source = "feeTradeApplied")
    @Mapping(target = "timestamp", source = "createdAt")
    TradeResponse toTradeResponse(Transaction transaction);
}
