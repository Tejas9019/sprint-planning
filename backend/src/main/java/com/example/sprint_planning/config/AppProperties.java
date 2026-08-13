package com.example.sprint_planning.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/** Binds top-level {@code app.*} settings (frontend URL, CORS origins). */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String frontendUrl,
        Cors cors) {

    public record Cors(List<String> allowedOrigins) {
    }
}
