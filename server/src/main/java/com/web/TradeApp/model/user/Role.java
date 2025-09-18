package com.web.TradeApp.model.user;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import static com.web.TradeApp.model.user.Permission.*;

// each role can have multiple permission
@RequiredArgsConstructor
public enum Role {
    TRADER(Collections.emptySet()), // Trader has no permission
    COMPANY(Collections.emptySet()),
    ADMIN(
            Set.of(
                    ADMIN_READ,
                    ADMIN_UPDATE,
                    ADMIN_CREATE,
                    ADMIN_DELETE));

    @Getter
    private final Set<Permission> permissions;

    public Set<GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> auths = new LinkedHashSet<>();
        // Role authority
        auths.add(new SimpleGrantedAuthority("ROLE_" + name()));
        // Fine-grained permissions (use the string value, not enum name)
        permissions.forEach(p -> auths.add(new SimpleGrantedAuthority(p.getPermission())));
        return auths;
    }
}
