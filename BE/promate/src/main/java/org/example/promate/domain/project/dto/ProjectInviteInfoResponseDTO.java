package org.example.promate.domain.project.dto;

import java.time.LocalDateTime;

public record ProjectInviteInfoResponseDTO(
        Long projectId,
        String projectTitle,
        String thumbnailUrl,
        LocalDateTime expiresAt
) {
}