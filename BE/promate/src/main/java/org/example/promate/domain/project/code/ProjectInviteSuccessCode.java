package org.example.promate.domain.project.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.promate.global.ApiPayload.code.BaseSuccessCode;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ProjectInviteSuccessCode implements BaseSuccessCode {

    CREATE_INVITE_SUCCESS(
            HttpStatus.OK,
            "INVITE_S001",
            "프로젝트 초대 링크 생성에 성공했습니다."
    );

    private final HttpStatus status;
    private final String code;
    private final String message;
}