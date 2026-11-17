package org.example.promate.domain.workspace.converter;

import org.example.promate.domain.project.entity.Member;
import org.example.promate.domain.workspace.dto.req.CommentReqDto;
import org.example.promate.domain.workspace.dto.res.CommentResDto;
import org.example.promate.domain.workspace.entity.Comment;
import org.example.promate.domain.workspace.entity.Post;

import java.time.LocalDateTime;
import java.util.List;

public class CommentConverter {

    public static Comment toEntity(CommentReqDto.AddCommentReqDto dto, Post post, Member member){
        return Comment.builder()
                .comment(dto.getComment())
                .post(post)
                .member(member)
                .build();
    }

    public static CommentResDto.AddedComment toAddedComment(Comment comment){
        return CommentResDto.AddedComment.builder()
                .commentId(comment.getId())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    public static CommentResDto.CommentDto toCommentDto(Comment comment){
        return CommentResDto.CommentDto.builder()
                .commentId(comment.getId())
                .writerId(comment.getMember().getUser().getId())
                .writer(comment.getMember().getUser().getName())
                .profileImageUrl(comment.getMember().getUser().getProfileImageUrl())
                .comment(comment.getComment())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }


    public static CommentResDto.CommentList toCommentList(List<Comment> comments){
        List<CommentResDto.CommentDto> list = comments.stream()
                .map(CommentConverter::toCommentDto)
                .toList();

        return CommentResDto.CommentList.builder()
                .commentList(list)
                .count(list.size())
                .build();
    }

    public static CommentResDto.UpdatedComment toUpdatedComment(Comment comment){
        return CommentResDto.UpdatedComment.builder()
                .commentId(comment.getId())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    public static CommentResDto.DeletedComment toDeletedComment(Long commentId){
        return CommentResDto.DeletedComment.builder()
                .commentId(commentId)
                .deletedAt(LocalDateTime.now())
                .build();
    }
}
