package org.example.promate.domain.project.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.promate.global.ApiPayload.code.BaseErrorCode;
import org.springframework.boot.actuate.autoconfigure.observation.ObservationProperties;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum MemberErrorCode implements BaseErrorCode {
    SCHEDULE_FORBIDDEN_NOT_PROJECT_MEMBER(HttpStatus.FORBIDDEN, "MEMBER_E001", "해당 프로젝트에 속한 사용자만 수행 가능합니다."),
    TASK_FORBIDDEN_NOT_PROJECT_MEMBER(HttpStatus.FORBIDDEN, "MEMBER_E002", "해당 프로젝트에 속한 사용자만 수행 가능합니다."),
    POST_FORBIDDEN_NOT_PROJECT_MEMBER(HttpStatus.FORBIDDEN, "MEMBER_E003", "해당 프로젝트에 속한 사용자만 수행 가능합니다."),
    MEMBER_FORBIDDEN_NOT_PROJECT_MEMBER(HttpStatus.FORBIDDEN, "MEMBER_E004", "해당 프로젝트에 속한 사용자만 수행 가능합니다."),
    NOT_PROJECT_MEMBER(HttpStatus.BAD_REQUEST, "MEMBER_E005", "해당 프로젝트의 멤버가 아닙니다."),
    ONLY_PROJECT_LEADER(HttpStatus.BAD_REQUEST, "MEMBER_E006", "멤버 역할 변경은 팀장만 가능합니다."),
    KICK_ONLY_PROJECT_LEADER(HttpStatus.BAD_REQUEST, "MEMBER_E007", "멤버 방출은 팀장만 가능합니다."),
    CANNOT_KICK_SELF(HttpStatus.BAD_REQUEST, "MEMBER_E008", "본인을 방출할 순 없습니다."),
    ;


    private final HttpStatus status;
    private final String code;
    private final String message;
}