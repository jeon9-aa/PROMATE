package org.example.promate.domain.chatRoom.dto.res;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

public class ChatRoomResDto {
    @Builder
    @Getter
    public static class CreatedChatRoomDto {
        Long chatRoomId;
    }

    @Builder
    @Getter
    public static class LeavedChatRoomDto {
        Long chatRoomId;
    }

    @Getter
    @Builder
    @JsonPropertyOrder({"reportId", "chatRoomId", "createdAt"})
    public static class ReportedChatRoomDto {
        Long reportId;
        Long chatRoomId;
        LocalDateTime createdAt;
    }

    @Getter
    @JsonPropertyOrder({"chatRoomId", "recruitId", "recruitTitle", "chatPartnerId", "chatPartnerProfileImageUrl", "lastMessage", "lastMessageAt", "unreadCount"})
    public static class ChatRoomDto {

        private Long chatRoomId;

        // 모집글 정보
        private Long recruitId;
        private String recruitTitle;

        // 상대방 정보
        private Long chatPartnerId;
        private String chatPartnerProfileImageUrl;

        // 메시지 합칠 때 추가
        private String lastMessage;
        private LocalDateTime lastMessageAt;
        private Long unreadCount;

        @Builder
        public ChatRoomDto(Long chatRoomId, Long recruitId, String recruitTitle, Long chatPartnerId, String chatPartnerProfileImageUrl) {
            this.chatRoomId = chatRoomId;
            this.recruitId = recruitId;
            this.recruitTitle = recruitTitle;
            this.chatPartnerId = chatPartnerId;
            this.chatPartnerProfileImageUrl = chatPartnerProfileImageUrl;
        }
    }
}
