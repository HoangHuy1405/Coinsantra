package com.web.TradeApp.model.user;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.web.TradeApp.model.BaseEntity;
import com.web.TradeApp.model.user.UserEnum.*;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.ForeignKey;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class User extends BaseEntity {
    @Column(unique = true, nullable = true)
    private String username;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = true) // nullable for Oauth users
    private String password;

    @Column(unique = true, nullable = false)
    @Email(message = "Email is not valid", regexp = "^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$")
    private String email;

    @Column(columnDefinition = "text")
    private String description;

    @Column(unique = true)
    private String phoneNum;

    private String profilePhotoUrl;
    private String profilePhotoPublicId; // canonical
    private Long profilePhotoVersion;

    @Column(columnDefinition = "text")
    private String refreshToken;

    @ElementCollection(fetch = FetchType.EAGER, targetClass = Role.class)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_user_roles_user")))
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 64)
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    // if locked, user cannot login
    private boolean accountLocked;
    // disable/enable user account
    private boolean enabled;

    @Column(nullable = false)
    private AuthProvider authProvider; // "local", "google", "github"..

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public List<String> getRoleNames() {
        return roles.stream()
                .map(Enum::name) // or Role::name
                .toList(); // Java 16+ (or use Collectors.toList() for older versions)
    }

}
