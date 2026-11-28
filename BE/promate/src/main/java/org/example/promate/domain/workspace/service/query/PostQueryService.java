package org.example.promate.domain.workspace.service.query;

import org.example.promate.domain.workspace.dto.res.PostResDto;
import org.example.promate.domain.workspace.enums.PostType;

import java.util.List;

public interface PostQueryService {
    PostResDto.PostDto getPost(Long userId, Long projectId, Long postId);
    List<PostResDto.PostSummaryDto> getAllPostByType(Long userId, Long projectId, PostType type);
}
