package org.example.promate.domain.recruit.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.example.promate.domain.recruit.enums.Category;

import java.time.LocalDate;

public record RecruitUpdateRequest(
        @NotBlank(message = "제목은 비워둘 수 없습니다.")
        String title,
        @NotBlank(message = "내용은 비워둘 수 없습니다.")
        String description,

        @JsonAlias("recruitImageUrl")
        String thumbnailUrl,
        @NotNull
        Category category,
        int totalSlots,
        LocalDate startDate,
        LocalDate endDate
) {
}
