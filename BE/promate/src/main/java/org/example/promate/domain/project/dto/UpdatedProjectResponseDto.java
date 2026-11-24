package org.example.promate.domain.project.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@JsonPropertyOrder({"projectId", "updatedAt"})
public class UpdatedProjectResponseDto {
    private Long projectId;
    private LocalDateTime updatedAt;
}