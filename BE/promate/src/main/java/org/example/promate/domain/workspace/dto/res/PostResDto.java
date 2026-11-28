package org.example.promate.domain.workspace.dto.res;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import org.example.promate.domain.workspace.dto.req.PostAttachedReqDto;
import org.example.promate.domain.workspace.enums.PostType;

import java.time.LocalDateTime;
import java.util.List;

public class PostResDto {

    @Builder
    @Getter
    @JsonPropertyOrder({"postId", "title", "createdAt"})
    public static class CreatedPostDto{
        Long postId;
        String title;
        LocalDateTime createdAt;
    }

    @Builder
    @Getter
    @JsonPropertyOrder({"postId", "updatedAt"})
    public static class UpdatedPostDto{
        Long postId;
        LocalDateTime updatedAt;
    }

    @Builder
    @Getter
    @JsonPropertyOrder({"postId"})
    public static class DeletedPostDto{
        Long postId;
        LocalDateTime deletedAt;
    }

    @Builder
    @Getter
    @JsonPropertyOrder({"postId", "postType", "writerName", "isPinned", "title", "content", "attached", "createdAt", "updatedAt"})
    public static class PostDto{
        Long postId;
        PostType postType;
        String writerName;
        boolean isPinned;
        String title;
        String content;
        List<PostAttachedResDto.AttachedResDto> attached;
        List<CommentResDto.CommentDto> commentList;
        LocalDateTime createdAt;
        LocalDateTime updatedAt;
    }

    @Builder
    @Getter
    @JsonPropertyOrder({"postId", "isPinned", "postType", "title", "writerName", "commentCount", "createdAt"})
    public static class PostSummaryDto{
        Long postId;
        PostType postType;
        String title;
        String writerName;
        LocalDateTime createdAt;
        boolean isPinned;
        Long commentCount;
    }
}