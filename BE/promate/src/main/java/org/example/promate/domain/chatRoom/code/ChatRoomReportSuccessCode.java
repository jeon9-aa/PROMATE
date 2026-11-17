package org.example.promate.domain.chatRoom.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.promate.global.ApiPayload.code.BaseSuccessCode;
import org.springframework.http.HttpStatus;


@AllArgsConstructor
@Getter
public enum ChatRoomReportSuccessCode implements BaseSuccessCode {
    CREATED(HttpStatus.CREATED, "CHATROOM_S001", "채팅방 신고가 성공적으로 이루어졌습니다."),
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;
}