package org.example.promate.domain.project.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.promate.domain.project.code.ProjectInviteSuccessCode;
import org.example.promate.domain.project.dto.ProjectInviteCreateRequestDTO;
import org.example.promate.domain.project.dto.ProjectInviteCreateResponseDTO;
import org.example.promate.domain.project.service.ProjectInviteService;
import org.example.promate.global.ApiPayload.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/projects")
public class ProjectInviteController {

    private final ProjectInviteService projectInviteService;

    @PostMapping("/{projectId}/invites")
    public ApiResponse<ProjectInviteCreateResponseDTO> createInvite(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long projectId,
            @RequestBody @Valid ProjectInviteCreateRequestDTO request
    ) {
        return ApiResponse.onSuccess(
                ProjectInviteSuccessCode.CREATE_INVITE_SUCCESS,
                projectInviteService.createInvite(projectId, userId, request)
        );
    }
}