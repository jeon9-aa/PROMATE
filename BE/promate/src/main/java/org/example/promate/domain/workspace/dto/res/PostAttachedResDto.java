package org.example.promate.domain.workspace.dto.res;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Builder;
import lombok.Getter;
import org.example.promate.domain.workspace.enums.AttachedType;

public class PostAttachedResDto {
    @Builder
    @Getter
    @JsonPropertyOrder({"postId", "deletedAt"})
    public static class AttachedResDto{
        AttachedType attachedType;
        String attachedUrl;
    }
}
