package com.example.sprint_planning.auth.dto;

import com.example.sprint_planning.auth.OtpPurpose;

import java.util.UUID;

/** Returned after signup/signin to drive the OTP entry screen. */
public record OtpChallengeResponse(
        UUID challengeId,
        String maskedEmail,
        OtpPurpose purpose,
        long expiresInSeconds) {
}
