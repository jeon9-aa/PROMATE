package org.example.promate.domain.workspace.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.promate.global.ApiPayload.code.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum CommentErrorCode implements BaseErrorCode {
    COMMENT_NOT_FOUND_IN_POST(HttpStatus.NOT_FOUND, "COMMENT_E001", "해당 게시글의 댓글이 아닙니다."),
    ONLY_WRITER_ACCESS_UPDATE(HttpStatus.FORBIDDEN, "COMMENT_E002", "댓글 작성자만 수정 가능합니다."),
    ONLY_WRITER_ACCESS_DELETE(HttpStatus.FORBIDDEN, "COMMENT_E003", "댓글 작성자만 삭제 가능합니다."),
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;
}
