package com.example.sprint_planning.common.exception;

import org.springframework.http.HttpStatus;

public class EmailAlreadyExistsException extends ApiException {

    public EmailAlreadyExistsException(String email) {
        super(HttpStatus.CONFLICT, "EMAIL_EXISTS", "An account with email '" + email + "' already exists");
    }
}
