package com.web.TradeApp.dto.AuthDTO;

import java.time.Instant;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterResponse {
    private UUID id;
    private String username;
    private String fullname;
    private String email;
    private String phoneNum;
    private String address;
    private Instant createdAt;
}
