package org.example.promate.domain.workspace.dto.res;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

public class CommentResDto {

    @Getter
    @Builder
    @JsonPropertyOrder({"commentId", "comment", "createdAt"})
    public static class AddedComment{
        private Long commentId;
        private LocalDateTime createdAt;
    }

    @Getter
    @Builder
    @JsonPropertyOrder({"commentId", "writerId", "writer", "profileImageUrl", "comment", "createdAt", "updatedAt"})
    public static class CommentDto{
        private Long commentId;
        private Long writerId;
        private String writer;
        private String profileImageUrl;
        private String comment;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Builder
    @JsonPropertyOrder({"count", "commentList"})
    public static class CommentList{
        private List<CommentDto> commentList;
        private int count;
    }

    @Getter
    @Builder
    @JsonPropertyOrder({"commentId", "updatedAt"})
    public static class UpdatedComment{
        private Long commentId;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Builder
    @JsonPropertyOrder({})
    public static class DeletedComment{
        private Long commentId;
        private LocalDateTime deletedAt;
    }
}
