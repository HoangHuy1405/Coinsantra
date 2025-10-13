package com.web.TradeApp.feature.user.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.web.TradeApp.exception.FunctionErrorException;
import com.web.TradeApp.exception.UserNotFoundException;
import com.web.TradeApp.feature.user.dto.CloudinaryDto;
import com.web.TradeApp.feature.user.dto.ProfileResponse;
import com.web.TradeApp.feature.user.dto.ProfileUpdateRequest;
import com.web.TradeApp.feature.user.entity.User;
import com.web.TradeApp.feature.user.repository.UserRepository;
import com.web.TradeApp.utils.FileUploadUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {
    private final UserRepository userRepository;
    private final Cloudinary cloudinary;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        System.out.println("User phoneNum:" + user.getPhoneNum());

        String profilePublicId = user.getProfilePhotoPublicId();
        Long profilePhotoVersion = user.getProfilePhotoVersion();
        String avatarUrl;
        if (profilePublicId == null || profilePublicId.isBlank() || profilePhotoVersion == null) {
            avatarUrl = user.getProfilePhotoUrl();
        } else {
            avatarUrl = buildAvatarUrl(user.getProfilePhotoPublicId(), user.getProfilePhotoVersion());
        }

        return toDto(user, avatarUrl);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(UUID userId, ProfileUpdateRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // validate if email uniqueness except its own user
        // if (req.email() != null && !req.email().equalsIgnoreCase(user.getEmail())) {
        // if (userRepository.existsByEmailAndIdNot(req.email(), userId)) {
        // throw new FunctionErrorException("Email is already in use");
        // }
        // user.setEmail(req.email());
        // }
        // validate if phoneNum uniqueness except its own user
        if (req.phoneNum() != null && !req.phoneNum().equals(user.getPhoneNum())) {
            if (userRepository.existsByPhoneNumAndIdNot(req.phoneNum(), userId)) {
                throw new FunctionErrorException("Phone number is already in use");
            }
            user.setPhoneNum(req.phoneNum());
        }
        if (req.username() != null) {
            user.setUsername(req.username().trim());
        }
        if (req.lastName() != null) {
            user.setLastName(req.lastName().trim());
        }
        if (req.firstName() != null) {
            user.setFirstName(req.firstName().trim());
        }
        if (req.description() != null) {
            user.setDescription(req.description().trim());
        }
        userRepository.save(user);
        String avatarUrl = buildAvatarUrl(user.getProfilePhotoPublicId(), user.getProfilePhotoVersion());
        return toDto(user, avatarUrl);
    }

    @Override
    @Transactional
    public ProfileResponse uploadAvatar(UUID userId, MultipartFile file) {
        final User user = this.userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // 1. validate file
        FileUploadUtil.assertAllowed(file, FileUploadUtil.IMAGE_PATTERN);

        // 2. build deterministic filename
        final String fileName = "avatar";

        // 3. upload to cloudinary (users/<id>/avatar) - override existing one if exists
        String path = String.format("users/%s/avatar", userId.toString());
        final CloudinaryDto cloudinary = this.cloudinaryService
                .uploadFile(file, fileName, path);

        // 4. Save to db
        user.setProfilePhotoUrl(cloudinary.getUrl());
        user.setProfilePhotoPublicId(cloudinary.getPublicId());
        user.setProfilePhotoVersion(cloudinary.getVersion());
        this.userRepository.save(user);

        final String avatarUrl = buildAvatarUrl(
                user.getProfilePhotoPublicId(),
                user.getProfilePhotoVersion());
        return toDto(user, avatarUrl);
    }

    // === helpers ===
    private ProfileResponse toDto(User u, String avatarUrl) {
        List<String> roleNames = u.getRoleNames();
        return ProfileResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .description(u.getDescription())
                .phoneNum(u.getPhoneNum())
                .avatarUrl(avatarUrl)
                .roles(roleNames)
                .build();
    }

    public String buildAvatarUrl(String publicId, Long version) {
        if (publicId == null || publicId.isBlank()) {
            return null;
        }
        return cloudinary.url()
                .secure(true)
                .version(version) // still useful for cache-busting
                .generate(publicId);
    }

}
