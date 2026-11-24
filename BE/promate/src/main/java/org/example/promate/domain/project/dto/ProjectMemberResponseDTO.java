package org.example.promate.domain.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProjectMemberResponseDTO {
    private String profileImageUrl;
    private Long userId;
    private String name;
    private Long memberId;
    private String role;
}