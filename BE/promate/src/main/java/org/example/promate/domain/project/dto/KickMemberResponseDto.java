package org.example.promate.domain.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Builder
@Getter
@AllArgsConstructor
public class KickMemberResponseDto {
    Long memberId;
    LocalDateTime deletedAt;
}
