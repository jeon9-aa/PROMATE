package org.example.promate.domain.chat.exception;

import org.example.promate.global.ApiPayload.code.BaseErrorCode;
import org.example.promate.global.ApiPayload.exception.GeneralException;

public class ChatMessageException extends GeneralException {

    public ChatMessageException(BaseErrorCode code) {
        super(code);
    }
}