package org.example.promate.domain.chat.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatMessageResponse {

    private Long messageId;

    private Long chatRoomId;

    private Long senderId;

    private String senderName;

    private String senderProfileImageUrl;

    private String content;

    private LocalDateTime createdAt;
}