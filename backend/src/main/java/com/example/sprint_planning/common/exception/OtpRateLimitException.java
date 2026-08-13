package com.example.sprint_planning.common.exception;

import org.springframework.http.HttpStatus;

public class OtpRateLimitException extends ApiException {

    public OtpRateLimitException(String message) {
        super(HttpStatus.TOO_MANY_REQUESTS, "OTP_RATE_LIMIT", message);
    }
}
