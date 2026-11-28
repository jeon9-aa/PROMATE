package org.example.promate.domain.workspace.converter;

import org.example.promate.domain.workspace.dto.req.PostAttachedReqDto;
import org.example.promate.domain.workspace.dto.res.PostAttachedResDto;
import org.example.promate.domain.workspace.entity.Post;
import org.example.promate.domain.workspace.entity.PostAttached;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class PostAttachedConverter {

    public static List<PostAttached> toEntity(List<PostAttachedReqDto.AttachedReqDto> dtoList, Post post){
        if (dtoList == null || dtoList.isEmpty()) {
            return Collections.emptyList();
        }

        return dtoList.stream()
                .map(attached -> PostAttached.builder()
                        .attachedType(attached.getAttachedType())
                        .attachedUrl(attached.getAttachedUrl())
                        .post(post)
                        .build())
                .collect(Collectors.toList());
    }

    public static PostAttachedResDto.AttachedResDto toAttachedDto(PostAttached postAttached){
        return PostAttachedResDto.AttachedResDto.builder()
                .attachedType(postAttached.getAttachedType())
                .attachedUrl(postAttached.getAttachedUrl())
                .build();
    }
}
