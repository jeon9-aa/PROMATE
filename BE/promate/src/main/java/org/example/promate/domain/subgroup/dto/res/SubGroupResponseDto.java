
package org.example.promate.domain.subgroup.dto.res;

import lombok.Builder;
import lombok.Getter;
import org.example.promate.domain.subgroup.enums.SubGroupRole;
import org.example.promate.domain.subgroup.enums.SubStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class SubGroupResponseDto {

    @Getter
    @Builder
    public static class CreatedSubGroup {
        private Long subGroupId;
        private String name;
        private int currentCount;
        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Getter
    @Builder
    public static class SubGroupInfo {
        private Long subgroupId;
        private String name;
        private String description;
        private SubStatus status;
        private int currentCount;
        private Integer capacity;
        private boolean isJoined;
        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Getter
    @Builder
    public static class SubGroupDetail {
        private Long subgroupId;
        private String name;
        private String description;
        private SubStatus status;
        private int currentCount;
        private Integer capacity;
        private boolean isJoined;
        private boolean isLeader;
        private LocalDateTime createdAt;
        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Getter
    @Builder
    public static class UpdatedSubGroup {
        private Long subgroupId;
        private String name;
        private String description;
        private int currentCount;
        private Integer capacity;
        private SubStatus status;
        private LocalDateTime updatedAt;
        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Getter
    @Builder
    public static class JoinedSubGroup {
        private Long subgroupId;
        private Long userId;
        private SubGroupRole role;
        private SubStatus status;
        private int currentCount;
        private Integer capacity;
    }

    @Getter
    @Builder
    public static class SubGroupMemberInfo {
        private Long userId;
        private String name;
        private String profileImageUrl;
        private SubGroupRole role;
    }
}
