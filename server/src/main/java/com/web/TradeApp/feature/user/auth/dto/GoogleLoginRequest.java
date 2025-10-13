package com.web.TradeApp.feature.user.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class GoogleLoginRequest {
    @NotBlank
    private String idToken;
}
