package org.example.promate.domain.project.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.promate.global.ApiPayload.code.BaseSuccessCode;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum MemberSuccessCode implements BaseSuccessCode {

    ROLE_CHANGE_SUCCESS(HttpStatus.OK, "MEMBER_S001", "프로젝트 멤버 역할 변경에 성공했습니다."),
    MEMBER_KICK_SUCCESS(HttpStatus.OK, "MEMBER_S002", "멤버를 성공적으로 방출했습니다."),
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;
}