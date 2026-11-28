
package org.example.promate.domain.subgroup.dto.req;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

public class SubGroupRequestDto {

    @Getter
    @Builder
    public static class CreateSubGroup {

        @NotBlank(message = "소모임 이름은 필수입니다.")
        @Size(max = 100)
        private String name;

        @Size(max = 1000)
        private String description;

        @NotNull(message = "모집 인원은 필수입니다.")
        @Min(value = 1, message = "최대 인원은 1명 이상이어야 합니다.")
        private Integer capacity;

        @NotNull(message = "소모임 시작일은 필수입니다.")
        private LocalDate startDate;

        @NotNull(message = "소모임 종료일은 필수입니다.")
        private LocalDate endDate;
    }

    @Getter
    @Builder
    public static class UpdateSubGroup {

        @Size(min = 1, max = 100)
        private String name;

        @Size(max = 1000)
        private String description;

        @Min(value = 1, message = "최대 인원은 1명 이상이어야 합니다.")
        private Integer capacity;

        // 수정 시 선택 입력 (null이면 기존 날짜 유지)
        private LocalDate startDate;

        private LocalDate endDate;
    }
}
