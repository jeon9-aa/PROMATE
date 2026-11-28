package org.example.promate.domain.workspace.service.query;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.project.code.MemberErrorCode;
import org.example.promate.domain.project.exception.MemberException;
import org.example.promate.domain.project.repository.MemberRepository;
import org.example.promate.domain.workspace.code.PostErrorCode;
import org.example.promate.domain.workspace.converter.CommentConverter;
import org.example.promate.domain.workspace.converter.PostConverter;
import org.example.promate.domain.workspace.dto.res.CommentResDto;
import org.example.promate.domain.workspace.dto.res.PostResDto;
import org.example.promate.domain.workspace.entity.Comment;
import org.example.promate.domain.workspace.entity.Post;
import org.example.promate.domain.workspace.enums.PostType;
import org.example.promate.domain.workspace.exception.PostException;
import org.example.promate.domain.workspace.repository.CommentRepository;
import org.example.promate.domain.workspace.repository.PostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostQueryServiceImpl implements PostQueryService {
    private final MemberRepository memberRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    @Override
    public PostResDto.PostDto getPost(Long userId, Long projectId, Long postId) {
        //검증1: 사용자가 프로젝트 멤버인가
        if (!memberRepository.existsByUserIdAndProjectId(userId, projectId)) {
            throw new MemberException(MemberErrorCode.POST_FORBIDDEN_NOT_PROJECT_MEMBER);
        }

        Post post = postRepository.findPostWithMemberAndUser(postId)
                .orElseThrow(() -> new PostException(PostErrorCode.NOT_FOUND_BY_POST_ID));

        List<Comment> commentsByPostId = commentRepository.findAllByPostIdWithMemberAndUser(postId);

        return PostConverter.toPostDto(post, commentsByPostId);
    }

    @Override
    public List<PostResDto.PostSummaryDto> getAllPostByType(Long userId, Long projectId, PostType type) {
        // 검증: 사용자가 프로젝트 멤버인가
        if (!memberRepository.existsByUserIdAndProjectId(userId, projectId)) {
            throw new MemberException(MemberErrorCode.POST_FORBIDDEN_NOT_PROJECT_MEMBER);
        }

        List<Post> posts = postRepository.findAllByProjectIdAndPostType(projectId, type);

        if (posts.isEmpty()) {
            return List.of();
        }

        List<Long> postIds = posts.stream()
                .map(Post::getId)
                .toList();

        Map<Long, Long> commentCountMap = commentRepository.countCommentsByPostIds(postIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],   //c.post.id(= postId)
                        row -> (Long) row[1]    //count(c)(= commentCount)
                ));

        return posts.stream()
                .map(post -> PostConverter.toPostSummaryDto(
                        post,
                        commentCountMap.getOrDefault(post.getId(), 0L) //postId 키가 존재하면 해당되는 값(commentCount), 없으면 0
                ))
                .toList();
    }
}
