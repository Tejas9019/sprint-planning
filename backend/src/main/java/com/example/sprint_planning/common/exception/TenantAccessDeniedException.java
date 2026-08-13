package com.example.sprint_planning.common.exception;

import org.springframework.http.HttpStatus;

public class TenantAccessDeniedException extends ApiException {

    public TenantAccessDeniedException(String message) {
        super(HttpStatus.FORBIDDEN, "TENANT_ACCESS_DENIED", message);
    }
}
