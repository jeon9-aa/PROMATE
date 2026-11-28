package org.example.promate.domain.workspace.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.promate.global.ApiPayload.code.BaseSuccessCode;
import org.springframework.http.HttpStatus;

@AllArgsConstructor
@Getter
public enum CommentSuccessCode implements BaseSuccessCode {
    CREATED(HttpStatus.CREATED, "COMMENT_S001", "댓글 추가에 성공했습니다."),
    OK(HttpStatus.OK, "COMMENT_S002", "댓글 조회에 성공했습니다."),
    UPDATE_SUCCESS(HttpStatus.OK, "COMMENT_S003", "댓글 수정에 성공했습니다."),
    DELETE_SUCCESS(HttpStatus.OK, "COMMENT_S004", "댓글 삭제에 성공했습니다."),
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;
}
