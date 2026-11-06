
package org.example.promate.domain.chat.controller;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.chat.dto.ChatMessageResponse;
import org.example.promate.domain.chat.service.ChatMessageService;
import org.example.promate.domain.chatRoom.code.ChatRoomSuccessCode;
import org.example.promate.global.ApiPayload.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatMessageQueryController {

    private final ChatMessageService chatMessageService;

    @GetMapping("/chat-rooms/{chatRoomId}/messages")
    public ApiResponse<List<ChatMessageResponse>> getMessages(
            @PathVariable Long chatRoomId,
            @AuthenticationPrincipal Long userId
    ) {

        List<ChatMessageResponse> messages =
                chatMessageService.getMessages(chatRoomId, userId);

        return ApiResponse.onSuccess(
                ChatRoomSuccessCode.OK,
                messages
        );
    }

    @PatchMapping("/chat-rooms/{chatRoomId}/messages/read") // 메시지 읽음처리
    public ApiResponse<Void> markMessagesAsRead(
            @PathVariable Long chatRoomId,
            @AuthenticationPrincipal Long userId
    ) {
        chatMessageService.markMessagesAsRead(chatRoomId, userId);

        return ApiResponse.onSuccess(
                ChatRoomSuccessCode.OK,
                null
        );
    }
}
