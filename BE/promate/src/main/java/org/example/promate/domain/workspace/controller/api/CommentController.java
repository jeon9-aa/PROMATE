package org.example.promate.domain.workspace.controller.api;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.workspace.code.CommentSuccessCode;
import org.example.promate.domain.workspace.controller.docs.CommentControllerDocs;
import org.example.promate.domain.workspace.dto.req.CommentReqDto;
import org.example.promate.domain.workspace.dto.res.CommentResDto;
import org.example.promate.domain.workspace.service.command.CommentCommandService;
import org.example.promate.domain.workspace.service.query.CommentQueryService;
import org.example.promate.global.ApiPayload.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/projects/{projectId}/posts/{postId}/comments")
public class CommentController implements CommentControllerDocs {
    private final CommentCommandService commentCommandService;
    private final CommentQueryService commentQueryService;

    // 댓글 추가하기
    @PostMapping()
    public ApiResponse<CommentResDto.AddedComment> addComment(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long projectId,
            @PathVariable Long postId,
            @RequestBody CommentReqDto.AddCommentReqDto dto
    ){
        return ApiResponse.onSuccess(CommentSuccessCode.CREATED, commentCommandService.addComment(userId, projectId, postId, dto));
    }

    // 댓글 조회하기
    @GetMapping()
    public ApiResponse<CommentResDto.CommentList> getComments(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long projectId,
            @PathVariable Long postId
    ){
        return ApiResponse.onSuccess(CommentSuccessCode.OK, commentQueryService.getComments(userId, projectId, postId));
    }

    // 댓글 수정하기
    @PutMapping("/{commentId}")
    public ApiResponse<CommentResDto.UpdatedComment> updateComment(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long projectId,
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @RequestBody CommentReqDto.UpdateCommentReqDto dto
    ){
        return ApiResponse.onSuccess(CommentSuccessCode.UPDATE_SUCCESS, commentCommandService.updateComment(userId, projectId, postId, commentId, dto));
    }

    // 댓글 삭제하기
    @DeleteMapping("/{commentId}")
    public ApiResponse<CommentResDto.DeletedComment> deleteComment(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long projectId,
            @PathVariable Long postId,
            @PathVariable Long commentId
    ){
        return ApiResponse.onSuccess(CommentSuccessCode.DELETE_SUCCESS, commentCommandService.deleteComment(userId, projectId, postId, commentId));
    }
}
