package com.example.sprint_planning.tenant.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateMemberRoleRequest(
        @NotBlank String role) {
}
