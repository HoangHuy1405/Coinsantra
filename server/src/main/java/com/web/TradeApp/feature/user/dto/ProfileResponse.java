package com.web.TradeApp.feature.user.dto;

import java.util.List;
import java.util.UUID;

import lombok.Builder;

@Builder
public record ProfileResponse(
                UUID id,
                String username,
                String firstName,
                String lastName,
                String email,
                String phoneNum,
                String description,
                List<String> roles, // Render as string for frontend
                String avatarUrl) {
}
