package org.example.promate.domain.project.service;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.project.code.MemberErrorCode;
import org.example.promate.domain.project.code.ProjectErrorCode;
import org.example.promate.domain.project.dto.KickMemberResponseDto;
import org.example.promate.domain.project.dto.RoleChangeResponseDto;
import org.example.promate.domain.project.entity.Member;
import org.example.promate.domain.project.entity.Project;
import org.example.promate.domain.project.exception.MemberException;
import org.example.promate.domain.project.exception.ProjectException;
import org.example.promate.domain.project.repository.MemberRepository;
import org.example.promate.domain.project.repository.ProjectRepository;
import org.example.promate.domain.recruit.entity.Recruit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final ProjectRepository projectRepository;

    // 멤버 역할 변경
    @Transactional
    public RoleChangeResponseDto changeMemberRole(Long userId, Long projectId, Long memberId, String role){
        // 검증1: 로그인 사용자가 프로젝트 멤버가 맞는가
        if(!memberRepository.existsByUserIdAndProjectId(userId, projectId)){
            throw new MemberException(MemberErrorCode.MEMBER_FORBIDDEN_NOT_PROJECT_MEMBER);
        }

        // 검증2: 해당 멤버가 프로젝트 멤버가 맞는가
        Member member = memberRepository.findByIdAndProjectIdWithProjectAndRecruit(memberId, projectId)
                .orElseThrow(() -> new MemberException(MemberErrorCode.NOT_PROJECT_MEMBER));

        Project project = member.getProject();

        // 검증3: 로그인 사용자가 팀장인가 - 지금은 팀장만 팀원 역할 변경 가능
        if(!userId.equals(project.getUser().getId())){
            throw new MemberException(MemberErrorCode.ONLY_PROJECT_LEADER);
        }

        member.changeRole(role);

        return RoleChangeResponseDto.builder()
                .memberId(member.getId())
                .updatedAt(member.getUpdatedAt())
                .build();
    }

    // 멤버 방출하기: Soft Delete
    @Transactional
    public KickMemberResponseDto kickMember(Long userId, Long projectId, Long memberId){
        // 검증1: 로그인 사용자가 프로젝트 멤버가 맞는가
        if(!memberRepository.existsByUserIdAndProjectId(userId, projectId)){
            throw new MemberException(MemberErrorCode.MEMBER_FORBIDDEN_NOT_PROJECT_MEMBER);
        }

        // 검증2: 해당 멤버가 프로젝트 멤버가 맞는가
        Member member = memberRepository.findByIdAndProjectIdWithProjectAndRecruit(memberId, projectId)
                .orElseThrow(() -> new MemberException(MemberErrorCode.NOT_PROJECT_MEMBER));

        Project project = member.getProject();
        Recruit recruit = project.getRecruit();

        // 검증3: 로그인 사용자가 팀장인가
        if(!userId.equals(project.getUser().getId())){
            throw new MemberException(MemberErrorCode.KICK_ONLY_PROJECT_LEADER);
        }

        // 검증4: 팀장이 팀장 본인을 방출하려고 하는가
        if (member.getUser().getId().equals(userId)) {
            throw new MemberException(MemberErrorCode.CANNOT_KICK_SELF);
        }

        member.delete();
        project.decreaseJoinedCount();
        recruit.decreaseJoinedCount();

        return KickMemberResponseDto.builder()
                .memberId(member.getId())
                .deletedAt(member.getDeletedAt())
                .build();
    }
}
