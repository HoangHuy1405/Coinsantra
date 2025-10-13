package com.web.TradeApp.feature.user.auth.dto;

import java.time.Instant;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RegisterResponse {
    private UUID id;
    private String email;
    private String urlToken;
    private Instant createdAt;
}
