package com.web.TradeApp.feature.user.auth.service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.web.TradeApp.exception.GoogleUserCreationException;
import com.web.TradeApp.exception.InvalidGoogleTokenException;
import com.web.TradeApp.feature.user.auth.constant.AuthProvider;
import com.web.TradeApp.feature.user.auth.constant.Role;
import com.web.TradeApp.feature.user.auth.dto.GoogleLoginRequest;
import com.web.TradeApp.feature.user.auth.dto.LoginResponse;
import com.web.TradeApp.feature.user.entity.User;
import com.web.TradeApp.feature.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SocialAuthServiceImpl implements SocialAuthService {
    private final UserRepository userRepository;
    private final AuthService authService;

    @Value("${google.oauth2.client-id}")
    private String googleClientId;

    @Override
    public LoginResponse loginGoogle(GoogleLoginRequest request) throws GeneralSecurityException, IOException {
        // Verify google token
        GoogleIdToken.Payload payload = verifyGoogleIdToken(request.getIdToken());
        if (payload == null)
            throw new InvalidGoogleTokenException("Google ID token could not be verified");

        // Extract user info from payload
        String email = payload.getEmail();
        String fullname = (String) payload.get("name");
        String firstName = (String) payload.get("given_name");
        String lastName = (String) payload.get("family_name");
        String avatarUrl = (String) payload.get("picture");

        if (email == null || email.isEmpty()) {
            throw new InvalidGoogleTokenException("Google account does not have a verified email");
        }

        // Check if this user's email exists in DB (registered?)
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user = userOpt.isPresent() ? userOpt.get() : null;
        if (!userOpt.isPresent()) {
            // New user -> create user
            user = this.createGoogleUser(email, fullname, firstName, lastName, avatarUrl);
            if (user == null) {
                throw new GoogleUserCreationException("Failed to create new Google user");
            }
        } else {
            // Exisiting user -> update info
            this.syncGoogleProfile(email, fullname, firstName, lastName, avatarUrl, user);
        }
        LoginResponse response = authService.createLoginRes(user, email);

        return response;
    }

    private GoogleIdToken.Payload verifyGoogleIdToken(String idToken) throws GeneralSecurityException, IOException {
        NetHttpTransport transport = new NetHttpTransport();
        GsonFactory jsonFactory = GsonFactory.getDefaultInstance();

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        System.out.println("🔍 Received ID Token: " + idToken.substring(0, 40) + "...");
        System.out.println("🔍 Using Google Client ID: " + googleClientId);

        GoogleIdToken verifiedIdToken = verifier.verify(idToken);
        if (verifiedIdToken == null) {
            throw new InvalidGoogleTokenException("Invalid or expired Google ID token");
        }
        return verifiedIdToken.getPayload();
    }

    private User createGoogleUser(String email, String fullname, String firstName, String lastName, String avatarUrl) {
        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .authProvider(AuthProvider.GOOGLE)
                .profilePhotoUrl(avatarUrl)
                .enabled(true)
                .accountLocked(false)
                .roles(Set.of(Role.TRADER))
                .build();

        return userRepository.save(user);
    }

    private void syncGoogleProfile(String email, String fullname, String firstName, String lastName, String avatarUrl,
            User userDb) {
        boolean updated = false;

        // only update avatar url

        // if (!Objects.equals(user.getFullName(), fullname)) {
        // String[] parts = fullname.split(" ", 2);
        // user.setFirstName(parts.length > 0 ? parts[0] : fullname);
        // user.setLastName(parts.length > 1 ? parts[1] : "");
        // updated = true;
        // }
        if (!Objects.equals(userDb.getProfilePhotoUrl(), avatarUrl)) {
            userDb.setProfilePhotoUrl(avatarUrl);
            updated = true;
        }
        if (!Objects.equals(userDb.getFirstName(), firstName)) {
            userDb.setFirstName(firstName);
            updated = true;
        }
        if (!Objects.equals(userDb.getLastName(), lastName)) {
            userDb.setFirstName(lastName);
            updated = true;
        }
        if (updated) {
            userRepository.save(userDb);
        }
    }

}
