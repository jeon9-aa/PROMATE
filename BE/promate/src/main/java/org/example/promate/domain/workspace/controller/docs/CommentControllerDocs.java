package org.example.promate.domain.workspace.controller.docs;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.promate.domain.workspace.code.CommentSuccessCode;
import org.example.promate.domain.workspace.dto.req.CommentReqDto;
import org.example.promate.domain.workspace.dto.req.PostReqDto;
import org.example.promate.domain.workspace.dto.res.CommentResDto;
import org.example.promate.domain.workspace.dto.res.PostResDto;
import org.example.promate.domain.workspace.enums.PostType;
import org.example.promate.domain.workspace.service.command.CommentCommandService;
import org.example.promate.domain.workspace.service.query.CommentQueryService;
import org.example.promate.global.ApiPayload.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@Tag(name = "WORKSPACE_POST_COMMENT", description = "WORKSPACE 도메인 내 팀 게시판 댓글 관리 API")
public interface CommentControllerDocs {

    // 댓글 추가하기
    @Operation(
            summary = "COMMENT_01 댓글 추가하기",
            operationId = "WORKSPACE_COMMENT_01",
            description = "게시글에 댓글을 추가합니다."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "댓글 추가 성공 (COMMENT_S001)",
                    content = @Content(schema = @Schema(implementation = CommentResDto.AddedComment.class))
            )
    })
    @PostMapping("/projects/{projectId}/posts/{postId}/comments")
    ApiResponse<CommentResDto.AddedComment> addComment(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long projectId,
            @PathVariable Long postId,
            @RequestBody CommentReqDto.AddCommentReqDto dto
    );

    // 댓글 조회하기
    @Operation(
            summary = "COMMENT_02 댓글 조회하기",
            operationId = "WORKSPACE_COMMENT_02",
            description = "게시글 내 모든 댓글을 조회합니다."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "댓글 조회 성공 (COMMENT_S002)",
                    content = @Content(schema = @Schema(implementation = CommentResDto.CommentList.class))
            )
    })
    @GetMapping("/projects/{projectId}/posts/{postId}/comments")
    ApiResponse<CommentResDto.CommentList> getComments(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long projectId,
            @PathVariable Long postId
    );

    // 댓글 수정하기
    @Operation(
            summary = "COMMENT_03 댓글 수정하기",
            operationId = "WORKSPACE_COMMENT_03",
            description = "댓글을 수정합니다."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "댓글 수정 성공 (COMMENT_S003)",
                    content = @Content(schema = @Schema(implementation = CommentResDto.UpdatedComment.class))
            )
    })
    @PutMapping("/projects/{projectId}/posts/{postId}/comments/{commentId}")
    ApiResponse<CommentResDto.UpdatedComment> updateComment(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long projectId,
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @RequestBody CommentReqDto.UpdateCommentReqDto dto
    );


    // 댓글 삭제하기
    @Operation(
            summary = "COMMENT_04 댓글 삭제하기",
            operationId = "WORKSPACE_COMMENT_04",
            description = "댓글을 Hard Delete 방식으로 삭제합니다."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "댓글 삭제 성공 (COMMENT_S004)",
                    content = @Content(schema = @Schema(implementation = CommentResDto.DeletedComment.class))
            )
    })
    @DeleteMapping("/projects/{projectId}/posts/{postId}/comments/{commentId}")
    ApiResponse<CommentResDto.DeletedComment> deleteComment(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long projectId,
            @PathVariable Long postId,
            @PathVariable Long commentId
    );
}