package org.example.promate.domain.subgroup.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.promate.domain.subgroup.code.SubGroupSuccessCode;
import org.example.promate.domain.subgroup.dto.req.SubGroupRequestDto;
import org.example.promate.domain.subgroup.dto.res.SubGroupResponseDto;
import org.example.promate.domain.subgroup.service.command.SubGroupCommendService;
import org.example.promate.domain.subgroup.service.query.SubGroupQueryService;
import org.example.promate.global.ApiPayload.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/projects/{projectId}/subgroups")
public class SubGroupController {
    private final SubGroupCommendService subGroupCommendService;
    private final SubGroupQueryService subGroupQueryService;

    // 소모임 생성
    @PostMapping()
    public ApiResponse<SubGroupResponseDto.CreatedSubGroup> createSubGroup(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long projectId,
            @Valid @RequestBody SubGroupRequestDto.CreateSubGroup dto
    ){
        return ApiResponse.onSuccess(SubGroupSuccessCode.SUBGROUP_CREATE_SUCCESS, subGroupCommendService.createSubGroup(userId, projectId, dto));
    }

    // 프로젝트 내 소모임 조회
    @GetMapping()
    public ApiResponse<List<SubGroupResponseDto.SubGroupInfo>> getAll(
            @PathVariable Long projectId,
            @AuthenticationPrincipal Long userId
    ){
        return ApiResponse.onSuccess(SubGroupSuccessCode.SUCCESS_GET_SUBGROUP, subGroupQueryService.getAll(userId, projectId));
    }

    // 소모임 상세 조회
    @GetMapping("/{subgroupId}")
    public ApiResponse<SubGroupResponseDto.SubGroupDetail> getDetail(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long projectId,
            @PathVariable Long subgroupId
    ){
        return ApiResponse.onSuccess(SubGroupSuccessCode.SUCCESS_GET_SUBGROUP, subGroupQueryService.getDetail(userId, projectId, subgroupId));
    }

    // 소모임 수정
    @PatchMapping("/{subgroupId}")
    public ApiResponse<SubGroupResponseDto.UpdatedSubGroup> updateSubGroup(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long projectId,
            @PathVariable Long subgroupId,
            @Valid @RequestBody SubGroupRequestDto.UpdateSubGroup dto
    ) {
        return ApiResponse.onSuccess(SubGroupSuccessCode.SUBGROUP_UPDATE_SUCCESS, subGroupCommendService.updateSubGroup(userId, projectId, subgroupId, dto));
    }

    // 소모임 삭제
    @DeleteMapping("/{subgroupId}")
    public ApiResponse<Void> deleteSubGroup(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long projectId,
            @PathVariable Long subgroupId
    ) {
        subGroupCommendService.deleteSubGroup(userId, projectId, subgroupId);

        return ApiResponse.onSuccess(SubGroupSuccessCode.SUBGROUP_DELETE_SUCCESS, null);
    }

    // 소모임 참여
    @PostMapping("/{subgroupId}/members/join")
    public ApiResponse<SubGroupResponseDto.JoinedSubGroup> joinSubGroup(
            @PathVariable Long projectId,
            @PathVariable Long subgroupId,
            @AuthenticationPrincipal Long userId
    ) {
        return ApiResponse.onSuccess(SubGroupSuccessCode.SUBGROUP_JOIN_SUCCESS, subGroupCommendService.joinSubGroup(userId, projectId, subgroupId));
    }

    // 소모임 탈퇴
    @DeleteMapping("/{subgroupId}/members/leave")
    public ApiResponse<Void> leaveSubGroup(
            @PathVariable Long projectId,
            @PathVariable Long subgroupId,
            @AuthenticationPrincipal Long userId
    ) {
        subGroupCommendService.leaveSubGroup(userId, projectId, subgroupId);

        return ApiResponse.onSuccess(SubGroupSuccessCode.SUBGROUP_LEAVE_SUCCESS, null);
    }

    // 소모임 멤버 조회
    @GetMapping("/{subgroupId}/members")
    public ApiResponse<List<SubGroupResponseDto.SubGroupMemberInfo>> getSubGroupMembers(
            @PathVariable Long projectId,
            @PathVariable Long subgroupId,
            @AuthenticationPrincipal Long userId
    ) {
        return ApiResponse.onSuccess(SubGroupSuccessCode.SUBGROUP_MEMBER_LIST_SUCCESS, subGroupQueryService.getSubGroupMembers(userId, projectId, subgroupId));
    }
}
