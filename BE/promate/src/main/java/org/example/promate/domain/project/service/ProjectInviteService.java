package org.example.promate.domain.project.service;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.project.dto.ProjectInviteCreateRequestDTO;
import org.example.promate.domain.project.dto.ProjectInviteCreateResponseDTO;
import org.example.promate.domain.project.entity.Project;
import org.example.promate.domain.project.entity.ProjectInvite;
import org.example.promate.domain.project.repository.ProjectInviteRepository;
import org.example.promate.domain.project.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectInviteService {

    private final ProjectRepository projectRepository;
    private final ProjectInviteRepository projectInviteRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Transactional
    public ProjectInviteCreateResponseDTO createInvite(
            Long projectId,
            Long userId,
            ProjectInviteCreateRequestDTO request
    ) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트가 존재하지 않습니다."));

        // 팀장만 초대 링크 생성 가능
        if (!project.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("팀장만 초대 링크를 생성할 수 있습니다.");
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
}