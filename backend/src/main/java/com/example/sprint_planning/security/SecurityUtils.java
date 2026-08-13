package com.example.sprint_planning.security;

import com.example.sprint_planning.common.exception.InvalidTokenException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

/** Convenience accessors for the current {@link AuthenticatedUser}. */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Optional<AuthenticatedUser> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthenticatedUser user) {
            return Optional.of(user);
        }
        return Optional.empty();
    }

    public static AuthenticatedUser requireCurrentUser() {
        return getCurrentUser().orElseThrow(() -> new InvalidTokenException("No authenticated user in context"));
    }

    public static UUID currentUserId() {
        return requireCurrentUser().id();
    }
}
