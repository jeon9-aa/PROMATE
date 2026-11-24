package org.example.promate.domain.project.dto;

import java.time.LocalDateTime;

public record ProjectInviteCreateResponseDTO(
        Long projectId,
        String token,
        String inviteUrl,
        LocalDateTime expiresAt

) {
}