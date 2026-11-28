
package org.example.promate.domain.subgroup.converter;

import org.example.promate.domain.project.entity.Project;
import org.example.promate.domain.subgroup.dto.req.SubGroupRequestDto;
import org.example.promate.domain.subgroup.dto.res.SubGroupResponseDto;
import org.example.promate.domain.subgroup.entity.SubGroup;
import org.example.promate.domain.subgroup.entity.SubGroupMember;
import org.example.promate.domain.subgroup.enums.SubGroupRole;
import org.example.promate.domain.subgroup.enums.SubStatus;
import org.example.promate.domain.user.entity.User;

public class SubGroupConverter {

    // 1. 소모임 엔티티 생성
    public static SubGroup toSubGroup(
            SubGroupRequestDto.CreateSubGroup dto,
            Project project
    ) {
        return SubGroup.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .capacity(dto.getCapacity())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .project(project)
                .status(SubStatus.RECRUITING)
                .currentCount(0)
                .build();
    }

    // 2. 소모임 멤버 엔티티 생성
    public static SubGroupMember toSubGroupMember(
            SubGroup subGroup,
            User user,
            SubGroupRole role
    ) {
        return SubGroupMember.builder()
                .subGroup(subGroup)
                .user(user)
                .role(role)
                .build();
    }

    // 3. 소모임 생성 응답
    public static SubGroupResponseDto.CreatedSubGroup toCreatedSubGroup(
            SubGroup subGroup
    ) {
        return SubGroupResponseDto.CreatedSubGroup.builder()
                .subGroupId(subGroup.getId())
                .name(subGroup.getName())
                .currentCount(subGroup.getCurrentCount())
                .startDate(subGroup.getStartDate())
                .endDate(subGroup.getEndDate())
                .build();
    }

    // 4. 소모임 목록 조회 응답
    public static SubGroupResponseDto.SubGroupInfo toSubGroupInfo(
            SubGroup subGroup,
            boolean isJoined
    ) {
        return SubGroupResponseDto.SubGroupInfo.builder()
                .subgroupId(subGroup.getId())
                .name(subGroup.getName())
                .description(subGroup.getDescription())
                .status(subGroup.getStatus())
                .capacity(subGroup.getCapacity())
                .currentCount(subGroup.getCurrentCount())
                .isJoined(isJoined)
                .startDate(subGroup.getStartDate())
                .endDate(subGroup.getEndDate())
                .build();
    }

    // 5. 소모임 상세 조회 응답
    public static SubGroupResponseDto.SubGroupDetail toSubGroupDetail(
            SubGroup subGroup,
            boolean isJoined,
            boolean isLeader
    ) {
        return SubGroupResponseDto.SubGroupDetail.builder()
                .subgroupId(subGroup.getId())
                .name(subGroup.getName())
                .description(subGroup.getDescription())
                .status(subGroup.getStatus())
                .capacity(subGroup.getCapacity())
                .currentCount(subGroup.getCurrentCount())
                .isJoined(isJoined)
                .isLeader(isLeader)
                .createdAt(subGroup.getCreatedAt())
                .startDate(subGroup.getStartDate())
                .endDate(subGroup.getEndDate())
                .build();
    }

    // 6. 소모임 수정 응답
    public static SubGroupResponseDto.UpdatedSubGroup toUpdatedSubGroup(
            SubGroup subGroup
    ) {
        return SubGroupResponseDto.UpdatedSubGroup.builder()
                .subgroupId(subGroup.getId())
                .name(subGroup.getName())
                .description(subGroup.getDescription())
                .capacity(subGroup.getCapacity())
                .currentCount(subGroup.getCurrentCount())
                .status(subGroup.getStatus())
                .updatedAt(subGroup.getUpdatedAt())
                .startDate(subGroup.getStartDate())
                .endDate(subGroup.getEndDate())
                .build();
    }

    // 7. 소모임 참여 응답
    public static SubGroupResponseDto.JoinedSubGroup toJoinedSubGroup(
            SubGroupMember subGroupMember
    ) {
        SubGroup subGroup = subGroupMember.getSubGroup();

        return SubGroupResponseDto.JoinedSubGroup.builder()
                .subgroupId(subGroup.getId())
                .userId(subGroupMember.getUser().getId())
                .role(subGroupMember.getRole())
                .status(subGroup.getStatus())
                .currentCount(subGroup.getCurrentCount())
                .capacity(subGroup.getCapacity())
                .build();
    }

    // 8. 소모임 멤버 조회 응답
    public static SubGroupResponseDto.SubGroupMemberInfo toSubGroupMemberInfo(
            SubGroupMember member
    ) {
        User user = member.getUser();

        return SubGroupResponseDto.SubGroupMemberInfo.builder()
                .userId(user.getId())
                .name(user.getName())
                .profileImageUrl(user.getProfileImageUrl())
                .role(member.getRole())
                .build();
    }
}
