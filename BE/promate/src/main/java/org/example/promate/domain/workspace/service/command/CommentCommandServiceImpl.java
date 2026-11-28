package org.example.promate.domain.workspace.service.command;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.project.code.MemberErrorCode;
import org.example.promate.domain.project.entity.Member;
import org.example.promate.domain.project.exception.MemberException;
import org.example.promate.domain.project.repository.MemberRepository;
import org.example.promate.domain.workspace.code.CommentErrorCode;
import org.example.promate.domain.workspace.code.PostErrorCode;
import org.example.promate.domain.workspace.converter.CommentConverter;
import org.example.promate.domain.workspace.dto.req.CommentReqDto;
import org.example.promate.domain.workspace.dto.res.CommentResDto;
import org.example.promate.domain.workspace.entity.Comment;
import org.example.promate.domain.workspace.entity.Post;
import org.example.promate.domain.workspace.exception.CommentException;
import org.example.promate.domain.workspace.exception.PostException;
import org.example.promate.domain.workspace.repository.CommentRepository;
import org.example.promate.domain.workspace.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentCommandServiceImpl implements CommentCommandService{
    private final MemberRepository memberRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    // 댓글 추가하기
    @Override
    public CommentResDto.AddedComment addComment(Long userId, Long projectId, Long postId, CommentReqDto.AddCommentReqDto dto) {
        // 검증1: 로그인 사용자가 참여 중인 프로젝트가 맞는가
        Member member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new MemberException(MemberErrorCode.POST_FORBIDDEN_NOT_PROJECT_MEMBER));

        // 검증2: 해당 프로젝트에 속한 게시글이 맞는가
        Post post = postRepository.findByIdAndProjectId(postId, projectId)
                .orElseThrow(() -> new PostException(PostErrorCode.POST_NOT_FOUND_IN_PROJECT));

        Comment comment = CommentConverter.toEntity(dto, post, member);

        commentRepository.save(comment);

        return CommentConverter.toAddedComment(comment);
    }

    // 댓글 수정하기
    @Override
    public CommentResDto.UpdatedComment updateComment(Long userId, Long projectId, Long postId, Long commentId, CommentReqDto.UpdateCommentReqDto dto) {
        // 검증1: 로그인 사용자가 참여 중인 프로젝트가 맞는가
        Member member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new MemberException(MemberErrorCode.POST_FORBIDDEN_NOT_PROJECT_MEMBER));

        // 검증2: 해당 프로젝트에 속한 게시글이 맞는가
        if(!postRepository.existsByIdAndProjectId(postId, projectId)) {
            throw new PostException(PostErrorCode.POST_NOT_FOUND_IN_PROJECT);
        }

        // 검증3: 해당 게시글의 댓글이 맞는가
        if(!commentRepository.existsByIdAndPostId(commentId, postId)){
            throw new CommentException(CommentErrorCode.COMMENT_NOT_FOUND_IN_POST);
        }

        // 검증4: 로그인 사용자가 작성한 댓글이 맞는가
        Comment comment = commentRepository.findByIdAndMember(commentId, member)
                .orElseThrow(() -> new CommentException(CommentErrorCode.ONLY_WRITER_ACCESS_UPDATE));

        comment.update(dto);

        return CommentConverter.toUpdatedComment(comment);
    }

    // 댓글 삭제하기
    @Override
    public CommentResDto.DeletedComment deleteComment(Long userId, Long projectId, Long postId, Long commentId) {
        // 검증1: 로그인 사용자가 참여 중인 프로젝트가 맞는가
        Member member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new MemberException(MemberErrorCode.POST_FORBIDDEN_NOT_PROJECT_MEMBER));

        // 검증2: 해당 프로젝트에 속한 게시글이 맞는가
        if(!postRepository.existsByIdAndProjectId(postId, projectId)) {
            throw new PostException(PostErrorCode.POST_NOT_FOUND_IN_PROJECT);
        }

        // 검증3: 해당 게시글의 댓글이 맞는가
        if(!commentRepository.existsByIdAndPostId(commentId, postId)){
            throw new CommentException(CommentErrorCode.COMMENT_NOT_FOUND_IN_POST);
        }

        // 검증4: 로그인 사용자가 작성한 댓글이 맞는가
        Comment comment = commentRepository.findByIdAndMember(commentId, member)
                .orElseThrow(() -> new CommentException(CommentErrorCode.ONLY_WRITER_ACCESS_DELETE));

        commentRepository.delete(comment);

        return CommentConverter.toDeletedComment(commentId);
    }
}
