package org.example.promate.domain.chatRoom.exception;

import org.example.promate.global.ApiPayload.code.BaseErrorCode;
import org.example.promate.global.ApiPayload.exception.GeneralException;

public class ChatRoomException extends GeneralException {
    public ChatRoomException(BaseErrorCode code){
        super(code);
    }
}