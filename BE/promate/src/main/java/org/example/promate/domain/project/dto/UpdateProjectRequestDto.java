package org.example.promate.domain.project.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.promate.domain.recruit.enums.Category;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class UpdateProjectRequestDto {
    private Category category;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String thumbnailUrl;
    private int totalSlots;
}

