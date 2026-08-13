package com.example.sprint_planning.auth.service;

import com.example.sprint_planning.auth.OtpPurpose;
import com.example.sprint_planning.auth.model.OtpCode;

import java.util.UUID;

public interface OtpService {

    /** Generate, persist (hashed) and deliver an OTP. Returns the new challenge record. */
    OtpCode createChallenge(UUID userId, String email, OtpPurpose purpose);

    /** Re-issue an OTP for an existing challenge (enforces resend cooldown). */
    OtpCode resend(UUID challengeId);

    /** Validate a submitted code for a challenge. Returns the consumed OTP record on success. */
    OtpCode verify(UUID challengeId, String code);
}
