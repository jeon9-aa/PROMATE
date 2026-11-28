package org.example.promate.domain.review.exception;

import lombok.Getter;
import org.example.promate.global.ApiPayload.code.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum ReviewErrorCode implements BaseErrorCode {

    PROJECT_NOT_COMPLETED(
            HttpStatus.BAD_REQUEST,
            "REVIEW_E001",
            "완료된 프로젝트만 팀원 평가를 진행할 수 있습니다."
    ),

    NOT_PROJECT_MEMBER(
            HttpStatus.FORBIDDEN,
            "REVIEW_E002",
            "해당 프로젝트 참여자만 팀원 평가를 진행할 수 있습니다."
    ),

    ALREADY_REVIEWED(
            HttpStatus.CONFLICT,
            "REVIEW_E003",
            "이미 팀원 평가를 제출한 프로젝트입니다."
    ),

    INVALID_REVIEW_TARGET(
            HttpStatus.BAD_REQUEST,
            "REVIEW_E004",
            "평가할 수 없는 사용자가 포함되어 있습니다."
    ),

    INVALID_SCORE(
            HttpStatus.BAD_REQUEST,
            "REVIEW_E005",
            "평가 점수는 1점 이상 5점 이하만 가능합니다."
    ),

    INCOMPLETE_REVIEW(
            HttpStatus.BAD_REQUEST,
            "REVIEW_E006",
                    "모든 팀원에 대한 평가를 완료해야 제출할 수 있습니다."
    ),

    DUPLICATE_REVIEW_TARGET(
            HttpStatus.BAD_REQUEST,
            "REVIEW_E007",
                    "동일한 팀원을 중복 평가할 수 없습니다."
    );

    private final HttpStatus status;
    private final String code;
    private final String message;

    ReviewErrorCode(
            HttpStatus status,
            String code,
            String message
    ) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}