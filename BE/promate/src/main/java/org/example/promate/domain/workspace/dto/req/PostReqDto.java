package org.example.promate.domain.workspace.dto.req;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.promate.domain.workspace.enums.PostType;

import java.util.List;

public class PostReqDto {

    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor
    public static class CreatePostDto{
        @NotBlank
        private String title;

        @NotBlank
        private String content;

        @NotNull
        private PostType postType;

        @Valid
        private List<PostAttachedReqDto.AttachedReqDto> postAttached;

        @NotNull
        private Boolean isPinned;

    }

    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor
    public static class UpdatePostDto{
        @NotBlank
        private String title;

        @NotBlank
        private String content;

        @NotNull
        private PostType postType;

        @Valid
        private List<PostAttachedReqDto.AttachedReqDto> postAttached;

        private boolean isPinned;
    }
}
