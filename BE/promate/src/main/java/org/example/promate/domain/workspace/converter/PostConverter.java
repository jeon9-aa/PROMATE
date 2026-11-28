package org.example.promate.domain.workspace.converter;

import org.example.promate.domain.project.entity.Member;
import org.example.promate.domain.project.entity.Project;
import org.example.promate.domain.user.entity.User;
import org.example.promate.domain.workspace.dto.req.PostReqDto;
import org.example.promate.domain.workspace.dto.res.PostResDto;
import org.example.promate.domain.workspace.entity.Comment;
import org.example.promate.domain.workspace.entity.Post;
import org.example.promate.domain.workspace.enums.PostType;

import java.time.LocalDateTime;
import java.util.List;

public class PostConverter {
    public static Post toEntity(PostReqDto.CreatePostDto dto, Member member, Project project){
        return Post.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .postType(dto.getPostType())
                .member(member)
                .project(project)
                .isPinned(Boolean.TRUE.equals(dto.getIsPinned()))
                .build();
    }

    public static PostResDto.CreatedPostDto toCreatedPostDto(Post post){
        return PostResDto.CreatedPostDto.builder()
                .postId(post.getId())
                .title(post.getTitle())
                .createdAt(post.getCreatedAt())
                .build();
    }

    public static PostResDto.UpdatedPostDto toUpdatedPostDto(Post post){
        return PostResDto.UpdatedPostDto.builder()
                .postId(post.getId())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    public static PostResDto.DeletedPostDto toDeletedPostDto(Post post){
        return PostResDto.DeletedPostDto.builder()
                .postId(post.getId())
                .deletedAt(LocalDateTime.now())
                .build();
    }

    public static PostResDto.PostDto toPostDto(Post post, List<Comment> comments){
        return PostResDto.PostDto.builder()
                .postId(post.getId())
                .postType(post.getPostType())
                .title(post.getTitle())
                .content(post.getContent())
                .writerName(post.getMember().getUser().getName())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .isPinned(post.isPinned())
                .attached(post.getAttachedList().stream()
                        .map(PostAttachedConverter::toAttachedDto)
                        .toList())
                .commentList(comments.stream()
                        .map(CommentConverter::toCommentDto)
                        .toList())
                .build();
    }

    public static PostResDto.PostSummaryDto toPostSummaryDto(Post post, Long commentCount) {
        return PostResDto.PostSummaryDto.builder()
                .postId(post.getId())
                .postType(post.getPostType())
                .title(post.getTitle())
                .writerName(post.getMember().getUser().getName())
                .createdAt(post.getCreatedAt())
                .isPinned(post.isPinned())
                .commentCount(commentCount)
                .build();
    }
}
