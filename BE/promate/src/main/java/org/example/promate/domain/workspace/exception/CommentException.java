package org.example.promate.domain.workspace.exception;

import org.example.promate.global.ApiPayload.code.BaseErrorCode;
import org.example.promate.global.ApiPayload.exception.GeneralException;

public class CommentException extends GeneralException {
    public CommentException(BaseErrorCode code){
        super(code);
    }
}