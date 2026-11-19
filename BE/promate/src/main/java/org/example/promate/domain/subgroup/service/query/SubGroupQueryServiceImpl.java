package org.example.promate.domain.subgroup.service.query;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.project.code.MemberErrorCode;
import org.example.promate.domain.project.code.ProjectErrorCode;
import org.example.promate.domain.project.exception.MemberException;
import org.example.promate.domain.project.exception.ProjectException;
import org.example.promate.domain.project.repository.MemberRepository;
import org.example.promate.domain.project.repository.ProjectRepository;
import org.example.promate.domain.subgroup.code.SubGroupErrorCode;
import org.example.promate.domain.subgroup.converter.SubGroupConverter;
import org.example.promate.domain.subgroup.dto.res.SubGroupResponseDto;
import org.example.promate.domain.subgroup.entity.SubGroup;
import org.example.promate.domain.subgroup.entity.SubGroupMember;
import org.example.promate.domain.subgroup.enums.SubGroupRole;
import org.example.promate.domain.subgroup.exception.SubGroupException;
import org.example.promate.domain.subgroup.repository.SubGroupMemberRepository;
import org.example.promate.domain.subgroup.repository.SubGroupRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubGroupQueryServiceImpl implements SubGroupQueryService{

    private final ProjectRepository projectRepository;
    private final MemberRepository memberRepository;
    private final SubGroupRepository subGroupRepository;
    private final SubGroupMemberRepository subGroupMemberRepository;

    @Override
    public List<SubGroupResponseDto.SubGroupInfo> getAll(Long userId, Long projectId) {
        // 1. 프로젝트 존재 검증
        if (!projectRepository.existsById(projectId)) {
            throw new ProjectException(ProjectErrorCode.ID_NOT_FOUND);
        }

        // 2. 프로젝트 멤버 여부 검증
        if (!memberRepository.existsByProjectIdAndUserIdAndIsDeletedFalse(projectId, userId)) {
            throw new MemberException(MemberErrorCode.MEMBER_FORBIDDEN_NOT_PROJECT_MEMBER);
        }

        // 3. 프로젝트에 속한 소모임 조회
        List<SubGroup> subGroups = subGroupRepository.findAllByProjectId(projectId);

        // 4. 응답 DTO 변환
        return subGroups.stream()
                .map(subGroup -> SubGroupConverter.toSubGroupInfo(
                        subGroup,
                        subGroupMemberRepository.existsBySubGroupIdAndUserId(subGroup.getId(), userId)
                ))
                .toList();
    }

    @Override
    public SubGroupResponseDto.SubGroupDetail getDetail(Long userId, Long projectId, Long subgroupId) {
        // 1. 프로젝트 존재 여부 검증
        if (!projectRepository.existsById(projectId)) {
            throw new ProjectException(ProjectErrorCode.ID_NOT_FOUND);
        }

        // 2. 프로젝트 멤버 여부 검증
        if (!memberRepository.existsByProjectIdAndUserIdAndIsDeletedFalse(projectId, userId)) {
            throw new MemberException(MemberErrorCode.MEMBER_FORBIDDEN_NOT_PROJECT_MEMBER);
        }

        // 3. 해당 프로젝트에 속한 소모임 조회
        SubGroup subGroup = subGroupRepository.findByIdAndProjectId(subgroupId, projectId)
                .orElseThrow(() -> new SubGroupException(SubGroupErrorCode.SUBGROUP_NOT_FOUND));

        // 4. 현재 사용자 참여 여부
        boolean isJoined = subGroupMemberRepository.existsBySubGroupIdAndUserId(subgroupId, userId);

        // 5. 리더 여부 파악
        boolean isLeader = subGroupMemberRepository.existsBySubGroupIdAndUserIdAndRole(
                subgroupId, userId, SubGroupRole.LEADER
        );

        // 6. Converter로 응답 변환
        return SubGroupConverter.toSubGroupDetail(subGroup, isJoined, isLeader);
    }

    @Override
    public List<SubGroupResponseDto.SubGroupMemberInfo> getSubGroupMembers(Long userId, Long projectId, Long subgroupId) {
        // 1. 프로젝트 존재 여부 검증
        if (!projectRepository.existsById(projectId)) {
            throw new ProjectException(ProjectErrorCode.ID_NOT_FOUND);
        }

        // 2. 프로젝트 멤버 여부 검증
        if (!memberRepository.existsByUserIdAndProjectId(userId, projectId)) {
            throw new MemberException(MemberErrorCode.MEMBER_FORBIDDEN_NOT_PROJECT_MEMBER);
        }

        // 3. 소모임 존재 및 프로젝트 소속 여부 검증
        if (!subGroupRepository.existsByIdAndProjectId(subgroupId, projectId)) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_NOT_FOUND);
        }

        // 4. 소모임 멤버 목록 조회
        List<SubGroupMember> members = subGroupMemberRepository.findAllBySubGroupId(subgroupId);

        // 5. Converter로 응답 변환
        return members.stream()
                .map(SubGroupConverter::toSubGroupMemberInfo)
                .toList();
    }
}
