package com.example.sprint_planning.user.dto;

import com.example.sprint_planning.user.AuthProvider;

import java.time.LocalDate;
import java.util.UUID;

/** Public view of a user — never exposes the password hash. */
public record UserResponse(
        UUID id,
        String firstName,
        String lastName,
        String fullName,
        String email,
        LocalDate dob,
        boolean enabled,
        boolean emailVerified,
        AuthProvider authProvider) {
}
