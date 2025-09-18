package com.web.TradeApp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.TradeApp.dto.AuthDTO.LoginResponse;
import com.web.TradeApp.model.user.User;
import com.web.TradeApp.service.interfaces.UserService;
import com.web.TradeApp.utils.SecurityUtil;
import com.web.TradeApp.utils.Annotation.ApiMessage;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

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
            userLogin.setFullname(currentUser.getFullName());
            userLogin.setRoles(roleNames);
            userGetAccount.setUser(userLogin);
        }

        return ResponseEntity.ok().body(userGetAccount);
    }
}
