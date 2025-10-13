package com.web.TradeApp.feature.user.service;

import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.web.TradeApp.feature.user.dto.ProfileResponse;
import com.web.TradeApp.feature.user.dto.ProfileUpdateRequest;

public interface UserProfileService {
    ProfileResponse getProfile(UUID userId);

    ProfileResponse updateProfile(UUID userId, ProfileUpdateRequest req);

    ProfileResponse uploadAvatar(UUID userId, MultipartFile file);
}
