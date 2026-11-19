package org.example.promate.domain.subgroup.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.promate.global.ApiPayload.code.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum SubGroupErrorCode implements BaseErrorCode {
    SUBGROUP_NOT_FOUND(HttpStatus.NOT_FOUND, "SUBGROUP_E001", "존재하지 않는 소모임입니다."),
    SUBGROUP_FORBIDDEN_NOT_LEADER(HttpStatus.FORBIDDEN, "SUBGROUP_E002", "수정 및 삭제는 작성자만 가능합니다."),
    SUBGROUP_INVALID_NAME(HttpStatus.FORBIDDEN, "SUBGROUP_E003", "유효한 소모임 이름이 아닙니다."),
    SUBGROUP_INVALID_CAPACITY(HttpStatus.FORBIDDEN, "SUBGROUP_E004", "최대 인원은 1명 이상이며 현재 참여 인원보다 작을 수 없습니다."),
    SUBGROUP_ALREADY_JOINED(HttpStatus.CONFLICT, "SUBGROUP_E005", "이미 참여 중인 소모임입니다."),
    SUBGROUP_NOT_RECRUITING(HttpStatus.CONFLICT, "SUBGROUP_E006", "현재 모집 중인 소모임이 아닙니다."),
    SUBGROUP_CAPACITY_EXCEEDED(HttpStatus.CONFLICT, "SUBGROUP_E007", "소모임의 최대 참여 인원을 초과했습니다."),
    SUBGROUP_NOT_JOINED(HttpStatus.NOT_FOUND, "SUBGROUP_E008", "참여하지 않은 소모임입니다."),
    SUBGROUP_LEADER_CANNOT_LEAVE(HttpStatus.FORBIDDEN, "SUBGROUP_E008","소모임 리더는 탈퇴할 수 없습니다. 소모임을 삭제해 주세요."),
    OVER_ONE_PEOPLE(HttpStatus.BAD_REQUEST, "SUBGROUP_E009","소모임 멤버는 한 명 이상이어야 합니다."),
    SUBGROUP_CAPACITY_EXCEEDS_PROJECT(HttpStatus.BAD_REQUEST, "SUBGROUP_E010", "소모임 최대 인원은 프로젝트 전체 모집 인원을 초과할 수 없습니다."),
    SUBGROUP_INVALID_DATE(HttpStatus.BAD_REQUEST, "SUBGROUP_E011", "소모임 기간은 프로젝트 기간 내에 있어야 합니다."),
    SUBGROUP_INVALID_DATE_RANGE(HttpStatus.BAD_REQUEST, "SUBGROUP_E012", "소모임 종료일은 시작일보다 빠를 수 없습니다."),
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;
}
