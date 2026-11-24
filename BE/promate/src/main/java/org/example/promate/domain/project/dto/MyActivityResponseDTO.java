package org.example.promate.domain.project.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class MyActivityResponseDTO {
    private Long projectId;
    private Long recruitmentId;
    private String title;
    private String recruitImageUrl; // 프로젝트 대표 이미지
    private Double averageReviewScore;
    private String description; // 프로젝트 설명
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isBookmarked;
}