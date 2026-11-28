package org.example.promate.domain.workspace.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.promate.domain.workspace.enums.AttachedType;

public class PostAttachedReqDto {

    @Getter
    @AllArgsConstructor
    public static class AttachedReqDto{
        @NotNull
        private AttachedType attachedType;

        @NotBlank
        private String attachedUrl;
    }
}
