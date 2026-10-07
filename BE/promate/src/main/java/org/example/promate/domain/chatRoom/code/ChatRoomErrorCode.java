package org.example.promate.domain.chatRoom.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.promate.global.ApiPayload.code.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ChatRoomErrorCode implements BaseErrorCode {
    CHAT_ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "CHATROOM_E001", "채팅방을 찾을 수 없습니다."),
    CANNOT_CHAT_WITH_SELF(HttpStatus.BAD_REQUEST, "CHATROOM_E002", "자기 자신과는 채팅을 시작할 수 없습니다."),
    CHAT_ROOM_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "CHATROOM_E003", "이미 존재하는 채팅방입니다."),
    NOT_CHAT_ROOM_PARTICIPANT(HttpStatus.BAD_REQUEST, "CHATROOM_E004", "채팅방 참여자가 아닙니다."),
    CHAT_PARTNER_NOT_FOUND(HttpStatus.NOT_FOUND, "CHATROOM_E005", "채팅방 상대를 찾을 수 없습니다."),
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;
}
