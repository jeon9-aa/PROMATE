package org.example.promate.domain.workspace.service.query;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.project.code.MemberErrorCode;
import org.example.promate.domain.project.exception.MemberException;
import org.example.promate.domain.project.repository.MemberRepository;
import org.example.promate.domain.workspace.code.PostErrorCode;
import org.example.promate.domain.workspace.converter.CommentConverter;
import org.example.promate.domain.workspace.dto.res.CommentResDto;
import org.example.promate.domain.workspace.entity.Comment;
import org.example.promate.domain.workspace.entity.Post;
import org.example.promate.domain.workspace.exception.PostException;
import org.example.promate.domain.workspace.repository.CommentRepository;
import org.example.promate.domain.workspace.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentQueryServiceImpl implements CommentQueryService{
    private final MemberRepository memberRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    @Override
    public CommentResDto.CommentList getComments(Long userId, Long projectId, Long postId) {
        // 검증1: 로그인 사용자가 참여 중인 프로젝트가 맞는가
        if(!memberRepository.existsByUserIdAndProjectId(userId, projectId)){
            throw new MemberException(MemberErrorCode.POST_FORBIDDEN_NOT_PROJECT_MEMBER);
        }

        // 검증2: 해당 프로젝트에 속한 게시글이 맞는가
        Post post = postRepository.findByIdAndProjectId(postId, projectId)
                .orElseThrow(() -> new PostException(PostErrorCode.POST_NOT_FOUND_IN_PROJECT));

        List<Comment> allByPostIdOrderByCreatedAtAsc = commentRepository.findAllByPostIdWithMemberAndUser(post.getId());

        return CommentConverter.toCommentList(allByPostIdOrderByCreatedAtAsc);
    }
}
