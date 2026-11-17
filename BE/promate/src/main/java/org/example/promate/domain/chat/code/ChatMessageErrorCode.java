package org.example.promate.domain.chat.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.promate.global.ApiPayload.code.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ChatMessageErrorCode implements BaseErrorCode {

    MESSAGE_CONTENT_EMPTY(HttpStatus.BAD_REQUEST, "CHATMSG_E001", "메시지 내용을 입력해주세요."),
    INVALID_MESSAGE_ID(HttpStatus.BAD_REQUEST, "CHATMSG_E002", "유효하지 않은 메시지 ID입니다."),

    WEBSOCKET_UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "CHATMSG_E003", "WebSocket 인증이 필요합니다."),
    WEBSOCKET_INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "CHATMSG_E004", "유효하지 않은 Access Token입니다."),
    WEBSOCKET_INVALID_DESTINATION(HttpStatus.BAD_REQUEST, "CHATMSG_E005", "잘못된 WebSocket 목적지입니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
