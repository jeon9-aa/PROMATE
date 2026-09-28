package org.example.promate.domain.chat.controller;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.chat.dto.ChatMessageRequest;
import org.example.promate.domain.chat.dto.ChatMessageResponse;
import org.example.promate.domain.chat.service.ChatMessageService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{chatRoomId}/messages")
    public void sendMessage(
            @DestinationVariable Long chatRoomId,
            ChatMessageRequest request
    ) {

        ChatMessageResponse response =
                chatMessageService.sendMessage(
                        chatRoomId,
                        userId,
                        request
                );

        messagingTemplate.convertAndSend(
                "/topic/chat/" + chatRoomId,
                response
        );
    }
}