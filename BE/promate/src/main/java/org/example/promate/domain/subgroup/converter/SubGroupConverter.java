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

    public static SubGroup toSubGroup(SubGroupRequestDto.CreateSubGroup dto, Project project) {
        return SubGroup.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .capacity(dto.getCapacity())
                .currentCount(0)
                .status(SubStatus.RECRUITING)
                .project(project)
                .build();
    }

    public static SubGroupMember toSubGroupMember(SubGroup subGroup, User user, SubGroupRole role) {
        return SubGroupMember.builder()
                .subGroup(subGroup)
                .user(user)
                .role(role)
                .build();
    }

    public static SubGroupResponseDto.CreatedSubGroup toCreatedSubGroup(SubGroup subGroup) {
        return SubGroupResponseDto.CreatedSubGroup.builder()
                .subGroupId(subGroup.getId())
                .name(subGroup.getName())
                .build();
    }

    public static SubGroupResponseDto.SubGroupInfo toSubGroupInfo(SubGroup subGroup, boolean isJoined) {
        return SubGroupResponseDto.SubGroupInfo.builder()
                .subgroupId(subGroup.getId())
                .name(subGroup.getName())
                .description(subGroup.getDescription())
                .status(subGroup.getStatus())
                .capacity(subGroup.getCapacity())
                .currentCount(subGroup.getCurrentCount())
                .isJoined(isJoined)
                .build();
    }

    public static SubGroupResponseDto.SubGroupDetail toSubGroupDetail(SubGroup subGroup, boolean isJoined, boolean isLeader) {
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
                .build();
    }

    public static SubGroupResponseDto.UpdatedSubGroup toUpdatedSubGroup(SubGroup subGroup) {
        return SubGroupResponseDto.UpdatedSubGroup.builder()
                .subgroupId(subGroup.getId())
                .name(subGroup.getName())
                .description(subGroup.getDescription())
                .capacity(subGroup.getCapacity())
                .status(subGroup.getStatus())
                .updatedAt(subGroup.getUpdatedAt())
                .build();
    }

    public static SubGroupResponseDto.JoinedSubGroup toJoinedSubGroup(SubGroupMember subGroupMember) {
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

    public static SubGroupResponseDto.SubGroupMemberInfo toSubGroupMemberInfo(SubGroupMember member) {
        User user = member.getUser();

        return SubGroupResponseDto.SubGroupMemberInfo.builder()
                .userId(user.getId())
                .name(user.getName())
                .profileImageUrl(user.getProfileImageUrl())
                .role(member.getRole())
                .build();
    }
}