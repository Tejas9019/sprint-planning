package com.example.sprint_planning.auth.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record VerifyOtpRequest(
        @NotNull UUID challengeId,
        @Pattern(regexp = "\\d{4,8}", message = "Code must be 4-8 digits") String code) {
}
