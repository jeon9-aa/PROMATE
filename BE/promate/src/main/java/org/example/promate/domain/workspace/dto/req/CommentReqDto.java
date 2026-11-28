package org.example.promate.domain.workspace.dto.req;

import lombok.AllArgsConstructor;
import lombok.Getter;

public class CommentReqDto {

    @Getter
    @AllArgsConstructor
    public static class AddCommentReqDto{
        private String comment;
    }

    @Getter
    @AllArgsConstructor
    public static class UpdateCommentReqDto{
        private String comment;
    }

}
