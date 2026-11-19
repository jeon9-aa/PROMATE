package org.example.promate.domain.project.dto;

import jakarta.validation.constraints.NotBlank;

public record ProjectInviteCreateRequestDTO(
    @NotBlank
    String password
) {
}