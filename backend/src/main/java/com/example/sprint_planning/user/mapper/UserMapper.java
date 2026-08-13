package com.example.sprint_planning.user.mapper;

import com.example.sprint_planning.user.dto.UserResponse;
import com.example.sprint_planning.user.model.User;
import org.springframework.stereotype.Component;

/** Pure mapping between {@link User} entities and DTOs. No business logic. */
@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getFullName(),
                user.getEmail(),
                user.getDob(),
                user.isEnabled(),
                user.isEmailVerified(),
                user.getAuthProvider());
    }
}
