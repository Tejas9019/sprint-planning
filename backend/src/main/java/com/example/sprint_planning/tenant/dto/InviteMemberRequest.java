package com.example.sprint_planning.tenant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InviteMemberRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Email String email,
        @NotBlank String role,
        @Size(max = 60) String department) {
}
