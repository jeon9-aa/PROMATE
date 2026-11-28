package org.example.promate.domain.subgroup.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.promate.global.ApiPayload.code.BaseSuccessCode;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum SubGroupSuccessCode implements BaseSuccessCode {

    SUBGROUP_CREATE_SUCCESS(HttpStatus.CREATED, "SUBGROUP_S001", "소모임 생성에 성공했습니다."),
    SUCCESS_GET_SUBGROUP(HttpStatus.OK, "SUBGROUP_S002", "소모임 조회에 성공했습니다."),
    SUBGROUP_UPDATE_SUCCESS(HttpStatus.OK, "SUBGROUP_S003", "소모임 수정에 성공했습니다."),
    SUBGROUP_DELETE_SUCCESS(HttpStatus.OK, "SUBGROUP_S004", "소모임 삭제에 성공했습니다."),
    SUBGROUP_JOIN_SUCCESS(HttpStatus.OK, "SUBGROUP_S005", "소모임 참여에 성공했습니다."),
    SUBGROUP_LEAVE_SUCCESS(HttpStatus.OK, "SUBGROUP_S006","소모임 탈퇴에 성공했습니다."),
    SUBGROUP_MEMBER_LIST_SUCCESS(HttpStatus.OK, "SUBGROUP_S007", "소모임 멤버 목록 조회에 성공했습니다."),
    ;


    private final HttpStatus status;
    private final String code;
    private final String message;

}