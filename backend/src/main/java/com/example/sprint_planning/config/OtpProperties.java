package com.example.sprint_planning.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/** Binds {@code app.otp.*}. */
@ConfigurationProperties(prefix = "app.otp")
public record OtpProperties(
        int length,
        Duration ttl,
        int maxAttempts,
        Duration resendCooldown,
        String delivery,
        String fromAddress) {
}
