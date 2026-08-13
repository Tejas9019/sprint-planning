package com.example.sprint_planning.common.exception;

import org.springframework.http.HttpStatus;

public class InvalidOtpException extends ApiException {

    public InvalidOtpException(String message) {
        super(HttpStatus.BAD_REQUEST, "INVALID_OTP", message);
    }
}
