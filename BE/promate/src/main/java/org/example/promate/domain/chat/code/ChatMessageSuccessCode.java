package org.example.promate.domain.chat.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.promate.global.ApiPayload.code.BaseSuccessCode;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ChatMessageSuccessCode implements BaseSuccessCode {

    MESSAGE_SENT(
            HttpStatus.OK,
            "CHATMSG_S001",
            "채팅 메시지 전송에 성공했습니다."
    );

    private final HttpStatus status;
    private final String code;
    private final String message;
}
