package org.example.promate.domain.project.service;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.apply.repository.ApplyRepository;
import org.example.promate.domain.project.code.ProjectErrorCode;
import org.example.promate.domain.project.dto.*;
import org.example.promate.domain.project.entity.Project;
import org.example.promate.domain.project.entity.ProjectInvite;
import org.example.promate.domain.project.repository.MemberRepository;
import org.example.promate.domain.project.repository.ProjectInviteRepository;
import org.example.promate.domain.project.repository.ProjectRepository;
import org.example.promate.domain.user.exception.UserErrorCode;
import org.example.promate.domain.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.example.promate.domain.apply.entity.Apply;
import org.example.promate.domain.apply.enums.Status;
import org.example.promate.domain.project.entity.Member;
import org.example.promate.domain.project.enums.Position;
import org.example.promate.domain.user.entity.User;
import java.time.LocalDateTime;
import java.util.UUID;

import org.example.promate.domain.project.code.ProjectInviteErrorCode;
import org.example.promate.global.ApiPayload.exception.GeneralException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectInviteService {

    private final ProjectRepository projectRepository;
    private final ProjectInviteRepository projectInviteRepository;
    private final PasswordEncoder passwordEncoder;
    private final MemberRepository memberRepository;
    private final ApplyRepository applyRepository;
    private final UserRepository userRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Transactional
    public ProjectInviteCreateResponseDTO createInvite(
            Long projectId,
            Long userId,
            ProjectInviteCreateRequestDTO request
    ) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new GeneralException(ProjectErrorCode.ID_NOT_FOUND)
                );

        // 팀장만 초대 링크 생성 가능
        if (!project.getUser().getId().equals(userId)) {
            throw new GeneralException(
                    ProjectInviteErrorCode.NOT_PROJECT_LEADER
            );
        }

        // 기존 활성 초대 링크 비활성화
        projectInviteRepository
                .findByProjectIdAndIsActiveTrue(projectId)
                .ifPresent(ProjectInvite::deactivate);

        String token = UUID.randomUUID().toString();

        LocalDateTime expiresAt = LocalDateTime.now().plusHours(24);

        ProjectInvite invite = ProjectInvite.builder()
                .project(project)
                .token(token)
                .passwordHash(passwordEncoder.encode(request.password()))
                .expiresAt(expiresAt)
                .build();

        projectInviteRepository.save(invite);

        String inviteUrl = frontendUrl + "/invite/" + token;

        return new ProjectInviteCreateResponseDTO(
                token,
                inviteUrl,
                expiresAt
        );
    }

    public ProjectInviteInfoResponseDTO getInviteInfo(String token) {

        ProjectInvite invite = projectInviteRepository.findByToken(token)
                .orElseThrow(() ->
                        new GeneralException(ProjectInviteErrorCode.INVITE_NOT_FOUND)
                );

        if (!invite.isActive()) {
            throw new GeneralException(ProjectInviteErrorCode.INVITE_INACTIVE);
        }

        if (invite.isExpired()) {
            throw new GeneralException(ProjectInviteErrorCode.INVITE_EXPIRED);
        }

        Project project = invite.getProject();

        return new ProjectInviteInfoResponseDTO(
                project.getId(),
                project.getTitle(),
                project.getThumbnailUrl(),
                invite.getExpiresAt()
        );
    }

    @Transactional
    public ProjectInviteJoinResponseDTO joinProject(
            String token,
            Long userId,
            ProjectInviteJoinRequestDTO request
    ) {

        // 1. 초대 링크 조회
        ProjectInvite invite = projectInviteRepository.findByToken(token)
                .orElseThrow(() ->
                        new GeneralException(ProjectInviteErrorCode.INVITE_NOT_FOUND)
                );

        // 2. 활성 여부 확인
        if (!invite.isActive()) {
            throw new GeneralException(ProjectInviteErrorCode.INVITE_INACTIVE);
        }

        // 3. 만료 확인
        if (invite.isExpired()) {
            throw new GeneralException(ProjectInviteErrorCode.INVITE_EXPIRED);
        }

        // 4. 비밀번호 확인
        if (!passwordEncoder.matches(
                request.password(),
                invite.getPasswordHash()
        )) {
            throw new GeneralException(
                    ProjectInviteErrorCode.INVALID_INVITE_PASSWORD
            );
        }

        Project project = invite.getProject();

        // 5. 이미 프로젝트 멤버인지 확인
        if (memberRepository.existsByProjectIdAndUserIdAndIsDeletedFalse(
                project.getId(),
                userId
        )) {
            throw new GeneralException(
                    ProjectInviteErrorCode.ALREADY_PROJECT_MEMBER
            );
        }

        // 6. 정원 확인
        if (project.getJoinedCount() >= project.getTotalSlots()) {
            throw new GeneralException(ProjectInviteErrorCode.PROJECT_FULL);
        }

        // 7. 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new GeneralException(UserErrorCode.USER_NOT_FOUND)
                );

        // 8. ACCEPTED 지원 기록 생성
        Apply apply = Apply.builder()
                .user(user)
                .recruit(project.getRecruit())
                .objective("초대 참여")
                .prContent(null)
                .status(Status.ACCEPTED)
                .build();

        applyRepository.save(apply);

        // 9. 프로젝트 멤버 추가
        Member member = Member.builder()
                .user(user)
                .project(project)
                .role("팀원")
                .position(Position.MEMBER)
                .build();

        memberRepository.save(member);

        // 10. 프로젝트 참여 인원 증가
        project.increaseJoinedCount();

        // 모집글이 존재한다면 모집 인원도 같이 증가
        if (project.getRecruit() != null) {
            project.getRecruit().increaseJoinedCount();
        }

        return new ProjectInviteJoinResponseDTO(
                project.getId(),
                project.getTitle()
        );
    }
}