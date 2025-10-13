package com.web.TradeApp.feature.user;

import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.web.TradeApp.feature.common.Annotation.ApiMessage;
import com.web.TradeApp.feature.user.auth.dto.LoginResponse;
import com.web.TradeApp.feature.user.dto.ChangePasswordRequest;
import com.web.TradeApp.feature.user.dto.ProfileResponse;
import com.web.TradeApp.feature.user.dto.ProfileUpdateRequest;
import com.web.TradeApp.feature.user.entity.User;
import com.web.TradeApp.feature.user.service.UserProfileService;
import com.web.TradeApp.feature.user.service.UserService;
import com.web.TradeApp.utils.SecurityUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserProfileService profileService;

    @GetMapping("/account")
    @ApiMessage("fetch account")
    public ResponseEntity<LoginResponse.UserGetAccount> getAccount() {
        String email = SecurityUtil.getCurrentUserLogin().isPresent() ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        User currentUser = this.userService.fetchUserByEmail(email);
        LoginResponse.UserLogin userLogin = new LoginResponse.UserLogin();
        LoginResponse.UserGetAccount userGetAccount = new LoginResponse.UserGetAccount();

        if (currentUser != null) {
            List<String> roleNames = currentUser.getRoles()
                    .stream()
                    .map(Enum::name) // convert Role enum to string (TRADER, ADMIN, etc.)
                    .toList();
            userLogin.setId(currentUser.getId());
            userLogin.setEmail(currentUser.getEmail());
            userLogin.setUsername(currentUser.getUsername());
            userLogin.setFirstName(currentUser.getFirstName());
            userLogin.setLastName(currentUser.getLastName());
            userLogin.setFullname(currentUser.getFullName());
            userLogin.setRoles(roleNames);
            userGetAccount.setUser(userLogin);
        }

        return ResponseEntity.ok().body(userGetAccount);
    }

    @GetMapping("/profile")
    @ApiMessage("User profile fetched successfully")
    public ResponseEntity<ProfileResponse> getProfile() {
        UUID userId = SecurityUtil.getCurrentUserId().isPresent() ? SecurityUtil.getCurrentUserId().get() : null;
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @PutMapping(path = "/profile", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ApiMessage("User profile updated successfully")
    public ResponseEntity<ProfileResponse> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request) {
        UUID userId = SecurityUtil.getCurrentUserId().isPresent() ? SecurityUtil.getCurrentUserId().get() : null;
        return ResponseEntity.ok(profileService.updateProfile(userId, request));
    }

    @PutMapping(path = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ApiMessage("Avatar updated successfully")
    public ResponseEntity<ProfileResponse> uploadImage(
            @RequestPart("file") MultipartFile file) {
        UUID userId = SecurityUtil.getCurrentUserId().isPresent() ? SecurityUtil.getCurrentUserId().get() : null;
        ProfileResponse response = this.profileService.uploadAvatar(userId, file);
        return ResponseEntity.ok().body(response);
    }

    @PatchMapping("/change-password")
    @ApiMessage("Password changed successfully")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest req) {
        userService.changePassword(req);
        return ResponseEntity.accepted().build();
    }
}
