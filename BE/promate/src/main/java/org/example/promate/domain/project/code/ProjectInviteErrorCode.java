package org.example.promate.domain.project.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.promate.global.ApiPayload.code.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ProjectInviteErrorCode implements BaseErrorCode {

    INVITE_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "INVITE_E001",
            "존재하지 않는 초대 링크입니다."
    ),

    INVITE_INACTIVE(
            HttpStatus.BAD_REQUEST,
            "INVITE_E002",
            "비활성화된 초대 링크입니다."
    ),

    INVITE_EXPIRED(
            HttpStatus.BAD_REQUEST,
            "INVITE_E003",
            "만료된 초대 링크입니다."
    ),

    INVALID_INVITE_PASSWORD(
            HttpStatus.BAD_REQUEST,
            "INVITE_E004",
            "초대 비밀번호가 일치하지 않습니다."
    ),

    ALREADY_PROJECT_MEMBER(
            HttpStatus.BAD_REQUEST,
            "INVITE_E005",
            "이미 참여 중인 프로젝트입니다."
    ),

    PROJECT_FULL(
            HttpStatus.BAD_REQUEST,
            "INVITE_E006",
            "프로젝트 정원이 가득 찼습니다."
    ),

    NOT_PROJECT_LEADER(
            HttpStatus.FORBIDDEN,
            "INVITE_E007",
            "팀장만 초대 링크를 생성할 수 있습니다."
    );

    private final HttpStatus status;
    private final String code;
    private final String message;
}