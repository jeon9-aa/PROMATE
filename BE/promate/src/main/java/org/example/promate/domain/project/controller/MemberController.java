package org.example.promate.domain.project.controller;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.project.code.MemberSuccessCode;
import org.example.promate.domain.project.dto.KickMemberResponseDto;
import org.example.promate.domain.project.dto.RoleChangeResponseDto;
import org.example.promate.domain.project.service.MemberService;
import org.example.promate.global.ApiPayload.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/projects/{projectId}/members")
public class MemberController {
    private final MemberService memberService;

    // 멤버 역할 변경
    @PatchMapping("/{memberId}/role")
    public ApiResponse<RoleChangeResponseDto> changeMemberRole(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long projectId,
            @PathVariable Long memberId,
            @RequestParam String role
    ){
        return ApiResponse.onSuccess(MemberSuccessCode.ROLE_CHANGE_SUCCESS, memberService.changeMemberRole(userId, projectId, memberId, role));
    }

    // 멤버 방출
    @DeleteMapping("/{memberId}")
    public ApiResponse<KickMemberResponseDto> kickMember(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long projectId,
            @PathVariable Long memberId
    ){
        return ApiResponse.onSuccess(MemberSuccessCode.MEMBER_KICK_SUCCESS, memberService.kickMember(userId, projectId, memberId));
    }
}
