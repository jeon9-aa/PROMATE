package org.example.promate.domain.workspace.service.query;

import org.example.promate.domain.workspace.dto.res.CommentResDto;

public interface CommentQueryService {
    CommentResDto.CommentList getComments(Long userId, Long projectId, Long postId);
}
