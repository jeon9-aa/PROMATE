package org.example.promate.domain.chatRoom.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.promate.global.ApiPayload.code.BaseSuccessCode;
import org.springframework.http.HttpStatus;


@AllArgsConstructor
@Getter
public enum ChatRoomSuccessCode implements BaseSuccessCode{
    CREATED(HttpStatus.CREATED, "CHATROOM_S001", "채팅방 생성에 성공했습니다."),
    OK(HttpStatus.OK, "CHATROOM_S002", "요청을 성공적으로 완료했습니다."),
    GET_CHAT_ROOM_SUCCESS(HttpStatus.OK, "CHATROOM_S003", "채팅방 조회에 성공했습니다."),
    GET_CHAT_ROOMS_SUCCESS(HttpStatus.OK, "CHATROOM_S004", "채팅방 목록 조회에 성공했습니다."),
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;
}
