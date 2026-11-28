package org.example.promate.domain.review.service;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.project.code.ProjectErrorCode;
import org.example.promate.domain.project.entity.Member;
import org.example.promate.domain.project.entity.Project;
import org.example.promate.domain.project.enums.ProjectStatus;
import org.example.promate.domain.project.exception.ProjectException;
import org.example.promate.domain.project.repository.MemberRepository;
import org.example.promate.domain.project.repository.ProjectRepository;
import org.example.promate.domain.review.dto.MemberReviewDetailResponseDTO;
import org.example.promate.domain.review.dto.MemberReviewRequestDTO;
import org.example.promate.domain.review.dto.MemberReviewResponseDTO;
import org.example.promate.domain.review.dto.ReviewStatusResponseDTO;
import org.example.promate.domain.review.entity.MemberReview;
import org.example.promate.domain.review.exception.ReviewErrorCode;
import org.example.promate.domain.review.exception.ReviewException;
import org.example.promate.domain.review.repository.MemberReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberReviewService {

    private final ProjectRepository projectRepository;
    private final MemberReviewRepository memberReviewRepository;
    private final MemberRepository memberRepository;

    public MemberReviewResponseDTO createMemberReviews(
            Long userId,
            Long projectId,
            MemberReviewRequestDTO request
    ) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectException(
                        ProjectErrorCode.ID_NOT_FOUND
                ));

        // 프로젝트 완료 상태 확인
        if (project.getStatus() != ProjectStatus.COMPLETED) {
            throw new ReviewException(
                    ReviewErrorCode.PROJECT_NOT_COMPLETED
            );
        }

        // 중복 제출 방지
        if (memberReviewRepository.existsByProjectIdAndReviewerId(
                projectId,
                userId
        )) {
            throw new ReviewException(
                    ReviewErrorCode.ALREADY_REVIEWED
            );
        }


        // 삭제되지 않은 프로젝트 멤버만 조회
                List<Member> members =
                        memberRepository.findAllByProjectIdAndIsDeletedFalse(projectId);

        // 본인을 제외한 실제 평가 대상자 ID
                Set<Long> memberIds = members.stream()
                        .map(member -> member.getUser().getId())
                        .filter(memberId -> !memberId.equals(userId))
                        .collect(Collectors.toSet());

        // 프론트에서 전달된 평가 대상자 ID
                Set<Long> requestIds = request.getReviews().stream()
                        .map(MemberReviewRequestDTO.ReviewItem::getRevieweeId)
                        .collect(Collectors.toSet());

        // 동일한 팀원을 중복 평가한 경우
                if (request.getReviews().size() != requestIds.size()) {
                    throw new ReviewException(
                            ReviewErrorCode.DUPLICATE_REVIEW_TARGET
                    );
                }

        // 1. 프로젝트 멤버가 아닌 사용자를 평가하려는 경우
                if (!memberIds.containsAll(requestIds)) {
                    throw new ReviewException(
                            ReviewErrorCode.INVALID_REVIEW_TARGET
                    );
                }

        // 2. 모든 팀원을 평가하지 않은 경우
                if (!requestIds.containsAll(memberIds)) {
                    throw new ReviewException(
                            ReviewErrorCode.INCOMPLETE_REVIEW
                    );
                }
        List<MemberReview> reviews = request.getReviews().stream()
                .map(item -> {

                    validateScore(item.getCommunicationScore());
                    validateScore(item.getProactivenessScore());
                    validateScore(item.getResponsibilityScore());
                    validateScore(item.getProblemSolvingScore());

                    return MemberReview.builder()
                            .projectId(projectId)
                            .reviewerId(userId)
                            .revieweeId(item.getRevieweeId())
                            .communicationScore(item.getCommunicationScore())
                            .proactivenessScore(item.getProactivenessScore())
                            .responsibilityScore(item.getResponsibilityScore())
                            .problemSolvingScore(item.getProblemSolvingScore())
                            .comment(item.getComment())
                            .build();
                })
                .collect(Collectors.toList());

        memberReviewRepository.saveAll(reviews);

        return new MemberReviewResponseDTO(
                reviews.size()
        );
    }

    private void validateScore(int score) {

        if (score < 1 || score > 5) {
            throw new ReviewException(
                    ReviewErrorCode.INVALID_SCORE
            );
        }
    }

    @Transactional(readOnly = true)
    public MemberReviewDetailResponseDTO getMyReviews(
            Long userId,
            Long projectId
    ) {
        if (!memberRepository.existsByUserIdAndProjectId(userId, projectId)) {
            throw new ReviewException(ReviewErrorCode.NOT_PROJECT_MEMBER);
        }

        List<MemberReview> reviews =
                memberReviewRepository.findByProjectIdAndRevieweeId(projectId, userId);

        List<MemberReviewDetailResponseDTO.ReviewDetail> reviewDetails = reviews.stream()
                .map(review -> {
                    double reviewAverage =
                            (review.getCommunicationScore()
                                    + review.getProactivenessScore()
                                    + review.getResponsibilityScore()
                                    + review.getProblemSolvingScore()) / 4.0;

                    return new MemberReviewDetailResponseDTO.ReviewDetail(
                            review.getCommunicationScore(),
                            review.getProactivenessScore(),
                            review.getResponsibilityScore(),
                            review.getProblemSolvingScore(),
                            Math.round(reviewAverage * 10) / 10.0,
                            review.getComment(),
                            review.getCreatedAt()
                    );
                })
                .toList();

        double totalAverage = reviewDetails.stream()
                .mapToDouble(MemberReviewDetailResponseDTO.ReviewDetail::getAverageScore)
                .average()
                .orElse(0.0);

        return new MemberReviewDetailResponseDTO(
                Math.round(totalAverage * 10) / 10.0,
                reviews.size(),
                reviewDetails
        );
    }

    @Transactional(readOnly = true)
    public List<MemberReviewResponseDTO.ReviewTarget> getReviewTargets(
            Long userId,
            Long projectId
    ) {
        if (!memberRepository.existsByUserIdAndProjectId(userId, projectId)) {
            throw new ReviewException(ReviewErrorCode.NOT_PROJECT_MEMBER);
        }

        return memberRepository.findAllByProjectIdAndIsDeletedFalse(projectId).stream()
                .filter(member -> !member.getUser().getId().equals(userId))
                .map(member -> new MemberReviewResponseDTO.ReviewTarget(
                        member.getUser().getId(),
                        member.getUser().getName()
                ))
                .toList();
    }

    // 상호평가 등록 상태 조회
    @Transactional(readOnly = true)
    public ReviewStatusResponseDTO getReviewStatus(
            Long userId,
            Long projectId
    ) {

        projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectException(
                        ProjectErrorCode.ID_NOT_FOUND
                ));

        if (!memberRepository.existsByUserIdAndProjectId(
                userId,
                projectId
        )) {
            throw new ReviewException(
                    ReviewErrorCode.NOT_PROJECT_MEMBER
            );
        }

        boolean reviewed =
                memberReviewRepository.existsByProjectIdAndReviewerId(
                        projectId,
                        userId
                );

        return new ReviewStatusResponseDTO(reviewed);
    }
}