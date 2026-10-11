package org.example.promate.domain.project.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.promate.domain.project.code.ProjectInviteSuccessCode;
import org.example.promate.domain.project.dto.*;
import org.example.promate.domain.project.service.ProjectInviteService;
import org.example.promate.global.ApiPayload.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ProjectInviteController {

    private final ProjectInviteService projectInviteService;

    @PostMapping("/projects/{projectId}/invites")
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

    @GetMapping("/invites/{token}")
    public ApiResponse<ProjectInviteInfoResponseDTO> getInviteInfo(
            @PathVariable String token
    ) {
        return ApiResponse.onSuccess(
                ProjectInviteSuccessCode.GET_INVITE_SUCCESS,
                projectInviteService.getInviteInfo(token)
        );
    }

    @PostMapping("/invites/{token}/join")
    public ApiResponse<ProjectInviteJoinResponseDTO> joinProject(
            @AuthenticationPrincipal Long userId,
            @PathVariable String token,
            @RequestBody @Valid ProjectInviteJoinRequestDTO request
    ) {
        return ApiResponse.onSuccess(
                ProjectInviteSuccessCode.JOIN_INVITE_SUCCESS,
                projectInviteService.joinProject(token, userId, request)
        );
    }
}