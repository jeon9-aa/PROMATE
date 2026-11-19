package org.example.promate.domain.subgroup.service.command;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.project.code.MemberErrorCode;
import org.example.promate.domain.project.code.ProjectErrorCode;
import org.example.promate.domain.project.entity.Project;
import org.example.promate.domain.project.exception.MemberException;
import org.example.promate.domain.project.exception.ProjectException;
import org.example.promate.domain.project.repository.MemberRepository;
import org.example.promate.domain.project.repository.ProjectRepository;
import org.example.promate.domain.subgroup.code.SubGroupErrorCode;
import org.example.promate.domain.subgroup.converter.SubGroupConverter;
import org.example.promate.domain.subgroup.dto.req.SubGroupRequestDto;
import org.example.promate.domain.subgroup.dto.res.SubGroupResponseDto;
import org.example.promate.domain.subgroup.entity.SubGroup;
import org.example.promate.domain.subgroup.entity.SubGroupMember;
import org.example.promate.domain.subgroup.enums.SubGroupRole;
import org.example.promate.domain.subgroup.enums.SubStatus;
import org.example.promate.domain.subgroup.exception.SubGroupException;
import org.example.promate.domain.subgroup.repository.SubGroupMemberRepository;
import org.example.promate.domain.subgroup.repository.SubGroupRepository;
import org.example.promate.domain.user.entity.User;
import org.example.promate.domain.user.exception.UserErrorCode;
import org.example.promate.domain.user.exception.UserException;
import org.example.promate.domain.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SubGroupCommendServiceImpl implements SubGroupCommendService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final MemberRepository memberRepository;
    private final SubGroupRepository subGroupRepository;
    private final SubGroupMemberRepository subGroupMemberRepository;


    @Override
    public SubGroupResponseDto.CreatedSubGroup createSubGroup(Long userId, Long projectId, SubGroupRequestDto.CreateSubGroup dto) {
        // 1. 사용자 존재 여부 검증
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        // 2. 프로젝트 존재 여부 검증
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectException(ProjectErrorCode.ID_NOT_FOUND));

        log.info("[소모임 생성] userId={}, projectId={}, isMember={}", userId, projectId);

        // 3. 프로젝트 멤버 여부 검증
        boolean isMember = memberRepository.existsByUserIdAndProjectId(userId, projectId);


        if (!isMember) {
            throw new MemberException(MemberErrorCode.MEMBER_FORBIDDEN_NOT_PROJECT_MEMBER);
        }

        // 4. 모집 인원 검증
        if (dto.getCapacity() == null || dto.getCapacity() < 1) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_INVALID_CAPACITY);
        }

        // 5. 프로젝트 전체 정원 초과 검증
        if (dto.getCapacity() > project.getTotalSlots()) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_CAPACITY_EXCEEDS_PROJECT);
        }

        // 6. 소모임 시작일 및 종료일 필수 검증
        if (dto.getStartDate() == null || dto.getEndDate() == null) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_INVALID_DATE);
        }

        // 7. 소모임 종료일이 시작일보다 빠른 경우
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_INVALID_DATE_RANGE);
        }

        // 8. 프로젝트 시작일보다 소모임 시작일이 빠른 경우
        if (project.getStartDate() != null && dto.getStartDate().isBefore(project.getStartDate())) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_INVALID_DATE);
        }

        // 9. 프로젝트 종료일보다 소모임 종료일이 늦은 경우
        if (project.getEndDate() != null && dto.getEndDate().isAfter(project.getEndDate())) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_INVALID_DATE);
        }

        // 10. 소모임 엔티티 생성
        SubGroup subGroup = SubGroupConverter.toSubGroup(dto, project);

        // 11. 생성자를 현재 인원에 포함
        subGroup.increaseCurrentCount();

        // 12. 정원 도달 시 모집 완료
        if (subGroup.getCurrentCount() >= subGroup.getCapacity()) {
            subGroup.complete();
        }

        // 13. 소모임 저장
        subGroupRepository.save(subGroup);

        // 14. 생성자를 소모임 리더로 등록
        SubGroupMember leader = SubGroupConverter.toSubGroupMember(subGroup, user, SubGroupRole.LEADER);

        subGroupMemberRepository.save(leader);

        // 15. 응답 반환
        return SubGroupConverter.toCreatedSubGroup(subGroup);
    }

    @Override
    public SubGroupResponseDto.UpdatedSubGroup updateSubGroup(Long userId, Long projectId, Long subgroupId, SubGroupRequestDto.UpdateSubGroup dto) {
        // 1. 프로젝트 존재 여부 검증
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectException(ProjectErrorCode.ID_NOT_FOUND));

        // 2. 프로젝트 멤버 여부 검증
        if (!memberRepository.existsByUserIdAndProjectId(userId, projectId)) {
            throw new MemberException(MemberErrorCode.MEMBER_FORBIDDEN_NOT_PROJECT_MEMBER);
        }

        // 3. 해당 프로젝트에 속한 소모임 조회 (비관적 락)
        SubGroup subGroup = subGroupRepository.findByIdAndProjectIdForUpdate(subgroupId, projectId)
                .orElseThrow(() -> new SubGroupException(SubGroupErrorCode.SUBGROUP_NOT_FOUND));

        // 4. 소모임 리더 권한 검증
        if (!subGroupMemberRepository.existsBySubGroupIdAndUserIdAndRole(subgroupId, userId, SubGroupRole.LEADER)) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_FORBIDDEN_NOT_LEADER);
        }

        // 5. 소모임 이름 검증
        if (dto.getName() != null && dto.getName().isBlank()) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_INVALID_NAME);
        }

        // 6. 모집 인원 검증
        if (dto.getCapacity() != null) {

            // 최소 1명 이상, 현재 인원 이상
            if (dto.getCapacity() < 1 || dto.getCapacity() < subGroup.getCurrentCount()) {
                throw new SubGroupException(SubGroupErrorCode.SUBGROUP_INVALID_CAPACITY);
            }

            // 프로젝트 전체 정원 초과 방지
            if (dto.getCapacity() > project.getTotalSlots()) {
                throw new SubGroupException(SubGroupErrorCode.SUBGROUP_CAPACITY_EXCEEDS_PROJECT);
            }
        }

        // 7. 수정할 날짜 결정 (null이면 기존 날짜 유지)
        LocalDate startDate = dto.getStartDate() != null ? dto.getStartDate() : subGroup.getStartDate();

        LocalDate endDate = dto.getEndDate() != null ? dto.getEndDate() : subGroup.getEndDate();

        // 8. 시작일 및 종료일 필수 검증
        if (startDate == null || endDate == null) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_INVALID_DATE);
        }

        // 9. 종료일이 시작일보다 빠른 경우
        if (endDate.isBefore(startDate)) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_INVALID_DATE_RANGE);
        }

        // 10. 프로젝트 시작일보다 소모임 시작일이 빠른 경우
        if (project.getStartDate() != null && startDate.isBefore(project.getStartDate())) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_INVALID_DATE);
        }

        // 11. 프로젝트 종료일보다 소모임 종료일이 늦은 경우
        if (project.getEndDate() != null && endDate.isAfter(project.getEndDate())) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_INVALID_DATE);
        }

        // 12. 엔티티 수정
        subGroup.update(dto.getName(), dto.getDescription(), dto.getCapacity(), startDate, endDate);

        // 13. 정원 변경에 따른 모집 상태 갱신
        if (subGroup.getCurrentCount() >= subGroup.getCapacity()) {
            subGroup.complete();
        } else {
            subGroup.recruit();
        }

        // 14. 응답 반환
        return SubGroupConverter.toUpdatedSubGroup(subGroup);
    }


    @Override
    public void deleteSubGroup(Long userId, Long projectId, Long subgroupId) {
        // 1. 프로젝트 존재 여부 검증
        if (!projectRepository.existsById(projectId)) {
            throw new ProjectException(ProjectErrorCode.ID_NOT_FOUND);
        }

        // 2. 프로젝트 멤버 여부 검증
        if (!memberRepository.existsByUserIdAndProjectId(userId, projectId)) {
            throw new MemberException(MemberErrorCode.MEMBER_FORBIDDEN_NOT_PROJECT_MEMBER);
        }

        // 3. 해당 프로젝트에 속한 소모임 조회
        SubGroup subGroup = subGroupRepository.findByIdAndProjectId(subgroupId, projectId)
                .orElseThrow(() -> new SubGroupException(SubGroupErrorCode.SUBGROUP_NOT_FOUND));

        // 4. 소모임 리더 권한 검증
        if (!subGroupMemberRepository.existsBySubGroupIdAndUserIdAndRole(subgroupId, userId, SubGroupRole.LEADER)) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_FORBIDDEN_NOT_LEADER);
        }

        // 5. 소모임 멤버 삭제
        subGroupMemberRepository.deleteAllBySubGroupId(subgroupId);

        // 6. 소모임 삭제
        subGroupRepository.delete(subGroup);
    }

    @Override
    public SubGroupResponseDto.JoinedSubGroup joinSubGroup(Long userId, Long projectId, Long subgroupId) {
        // 1. 프로젝트 존재 여부 검증
        if (!projectRepository.existsById(projectId)) {
            throw new ProjectException(ProjectErrorCode.ID_NOT_FOUND);
        }

        // 2. 프로젝트 멤버 여부 검증
        if (!memberRepository.existsByUserIdAndProjectId(userId, projectId)) {
            throw new MemberException(MemberErrorCode.MEMBER_FORBIDDEN_NOT_PROJECT_MEMBER);
        }

        // 3. 소모임 조회 (동시 가입 방지를 위한 락)
        SubGroup subGroup = subGroupRepository.findByIdAndProjectIdForUpdate(subgroupId, projectId)
                .orElseThrow(() -> new SubGroupException(SubGroupErrorCode.SUBGROUP_NOT_FOUND));

        // 4. 중복 참여 검증
        if (subGroupMemberRepository.existsBySubGroupIdAndUserId(subgroupId, userId)) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_ALREADY_JOINED);
        }

        // 5. 모집 상태 검증
        if (subGroup.getStatus() != SubStatus.RECRUITING) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_NOT_RECRUITING);
        }

        // 6. 정원 초과 검증
        Integer capacity = subGroup.getCapacity();

        if (capacity != null && subGroup.getCurrentCount() >= capacity) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_CAPACITY_EXCEEDED);
        }

        // 7. 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        // 8. 소모임 멤버 생성 및 저장
        SubGroupMember subGroupMember = SubGroupConverter.toSubGroupMember(
                subGroup, user, SubGroupRole.MEMBER
        );

        subGroupMemberRepository.save(subGroupMember);

        // 9. 현재 인원 증가
        subGroup.increaseCurrentCount();

        // 10. 정원 도달 시 모집 완료
        if (capacity != null && subGroup.getCurrentCount() >= capacity) {
            subGroup.complete();
        }

        // 11. Converter로 응답 변환
        return SubGroupConverter.toJoinedSubGroup(subGroupMember);
    }

    @Override
    public void leaveSubGroup(Long userId, Long projectId, Long subgroupId) {
        // 1. 프로젝트 존재 여부 검증
        if (!projectRepository.existsById(projectId)) {
            throw new ProjectException(ProjectErrorCode.ID_NOT_FOUND);
        }

        // 2. 프로젝트 멤버 여부 검증
        if (!memberRepository.existsByUserIdAndProjectId(userId, projectId)) {
            throw new MemberException(MemberErrorCode.MEMBER_FORBIDDEN_NOT_PROJECT_MEMBER);
        }

        // 3. 소모임 조회 (비관적 락)
        SubGroup subGroup = subGroupRepository.findByIdAndProjectIdForUpdate(subgroupId, projectId)
                .orElseThrow(() -> new SubGroupException(SubGroupErrorCode.SUBGROUP_NOT_FOUND));

        // 4. 소모임 참여 여부 검증
        SubGroupMember subGroupMember = subGroupMemberRepository.findBySubGroupIdAndUserId(subgroupId, userId)
                .orElseThrow(() -> new SubGroupException(SubGroupErrorCode.SUBGROUP_NOT_JOINED));

        // 5. 리더 탈퇴 방지
        if (subGroupMember.getRole() == SubGroupRole.LEADER) {
            throw new SubGroupException(SubGroupErrorCode.SUBGROUP_LEADER_CANNOT_LEAVE);
        }

        // 6. 소모임 멤버 삭제
        subGroupMemberRepository.delete(subGroupMember);

        // 7. 현재 인원 감소
        subGroup.decreaseCurrentCount();

        // 8. 정원으로 마감된 소모임 다시 모집 중으로 변경
        if (subGroup.getStatus() == SubStatus.COMPLETED) {
            subGroup.recruit();
        }
    }
}
