package org.example.promate.domain.workspace.service.command;

import org.example.promate.domain.workspace.dto.req.CommentReqDto;
import org.example.promate.domain.workspace.dto.res.CommentResDto;

public interface CommentCommandService {
    CommentResDto.AddedComment addComment(Long userId, Long projectId, Long postId, CommentReqDto.AddCommentReqDto dto);
    CommentResDto.UpdatedComment updateComment(Long userId, Long projectId, Long postId, Long commentId, CommentReqDto.UpdateCommentReqDto dto);
    CommentResDto.DeletedComment deleteComment(Long userId, Long projectId, Long postId, Long commentId);
}
