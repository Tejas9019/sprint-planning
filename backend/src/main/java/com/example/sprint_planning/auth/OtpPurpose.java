package com.example.sprint_planning.auth;

/** What an OTP challenge is for. */
public enum OtpPurpose {
    /** Second factor after a valid password sign-in. */
    SIGNIN,
    /** Email-ownership verification after signup. */
    SIGNUP_VERIFY
}
