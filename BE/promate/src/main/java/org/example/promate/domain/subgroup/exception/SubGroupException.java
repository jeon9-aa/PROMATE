package org.example.promate.domain.subgroup.exception;

import org.example.promate.global.ApiPayload.code.BaseErrorCode;
import org.example.promate.global.ApiPayload.exception.GeneralException;

public class SubGroupException extends GeneralException {
    public SubGroupException(BaseErrorCode code){
        super(code);
    }
}
