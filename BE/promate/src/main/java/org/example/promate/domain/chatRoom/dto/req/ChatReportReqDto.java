package org.example.promate.domain.chatRoom.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class ChatReportReqDto {

    @Builder
    @Getter
    @AllArgsConstructor
    public static class ReportChatRoom{
        @NotBlank(message = "신고 내용을 입력해주세요.")
        @Size(max = 500, message = "신고 내용은 500자 이하로 입력해주세요.")
        private String detail;
    }
}
