package com.example.sprint_planning.auth.service;

import com.example.sprint_planning.auth.dto.AuthTokensResponse;
import com.example.sprint_planning.auth.dto.CurrentUserResponse;
import com.example.sprint_planning.auth.dto.OtpChallengeResponse;
import com.example.sprint_planning.auth.dto.SigninRequest;
import com.example.sprint_planning.auth.dto.SignupRequest;
import com.example.sprint_planning.auth.dto.VerifyOtpRequest;
import com.example.sprint_planning.security.AuthenticatedUser;
import com.example.sprint_planning.user.model.User;

import java.util.UUID;

public interface AuthService {

    /** Register a LOCAL user, create their personal tenant, and issue a signup-verification OTP. */
    OtpChallengeResponse signup(SignupRequest request);

    /** Verify password, then issue a sign-in OTP (no tokens yet). */
    OtpChallengeResponse signin(SigninRequest request);

    /** Validate the OTP and mint the authenticated session. */
    AuthTokensResponse verifyOtp(VerifyOtpRequest request, String userAgent, String ip);

    /** Re-send the OTP for an existing challenge. */
    OtpChallengeResponse resendOtp(UUID challengeId);

    /** Rotate the refresh token and mint a fresh access token. */
    AuthTokensResponse refresh(String refreshToken, String userAgent, String ip);

    /** Revoke a refresh token. */
    void logout(String refreshToken);

    /** Re-mint a session scoped to a different tenant the user actively belongs to. */
    AuthTokensResponse switchTenant(UUID userId, UUID tenantId, String userAgent, String ip);

    /** Build a session for a user authenticated via OAuth (Google). */
    AuthTokensResponse issueOAuthSession(User user, String userAgent, String ip);

    /** Current principal snapshot for {@code /auth/me}. */
    CurrentUserResponse getCurrentUser(AuthenticatedUser principal);
}
