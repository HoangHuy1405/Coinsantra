package com.web.TradeApp.config;

import com.web.TradeApp.model.user.Role;
import com.web.TradeApp.model.user.User;
import com.web.TradeApp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedAdmin(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = User.builder()
                        .username("admin")
                        .firstName("System")
                        .lastName("Admin")
                        .email("admin@example.com")
                        .password(passwordEncoder.encode("admin")) // Never store plain passwords
                        .roles(Set.of(Role.ADMIN, Role.TRADER)) // Assuming you have Role enum with ADMIN
                        .enabled(true)
                        .accountLocked(false)
                        .build();

                userRepository.save(admin);
            }
        };
    }
}
