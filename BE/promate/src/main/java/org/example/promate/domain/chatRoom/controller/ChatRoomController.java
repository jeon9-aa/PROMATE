package org.example.promate.domain.chatRoom.controller;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.chatRoom.code.ChatRoomReportSuccessCode;
import org.example.promate.domain.chatRoom.code.ChatRoomSuccessCode;
import org.example.promate.domain.chatRoom.dto.req.ChatReportReqDto;
import org.example.promate.domain.chatRoom.dto.res.ChatRoomResDto;
import org.example.promate.domain.chatRoom.service.command.ChatRoomCommandService;
import org.example.promate.domain.chatRoom.service.query.ChatRoomQueryService;
import org.example.promate.global.ApiPayload.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatRoomController {
    private final ChatRoomCommandService chatRoomCommandService;
    private final ChatRoomQueryService chatRoomQueryService;


    @PostMapping("/recruitments/{recruitmentId}/chat-rooms")
    public ApiResponse<ChatRoomResDto.CreatedChatRoomDto> createChatRoom(
            @PathVariable Long recruitmentId,
            @AuthenticationPrincipal Long userId
    ){
        return ApiResponse.onSuccess(ChatRoomSuccessCode.CREATED, chatRoomCommandService.createChatRoom(recruitmentId, userId));
    }

    @DeleteMapping("/chat-rooms/{chatRoomId}/leave")
    public ApiResponse<ChatRoomResDto.LeavedChatRoomDto> leaveChatRoom(
            @PathVariable Long chatRoomId,
            @AuthenticationPrincipal Long userId
    ){
        return ApiResponse.onSuccess(ChatRoomSuccessCode.OK, chatRoomCommandService.leaveChatRoom(chatRoomId, userId));
    }

    @PostMapping("/chat-rooms/{chatRoomId}/reports")
    public ApiResponse<ChatRoomResDto.ReportedChatRoomDto> reportChatRoom(
            @PathVariable Long chatRoomId,
            @AuthenticationPrincipal Long userId,
            @RequestBody ChatReportReqDto.ReportChatRoom dto
    ){
        return ApiResponse.onSuccess(ChatRoomReportSuccessCode.CREATED, chatRoomCommandService.reportChatRoom(chatRoomId, userId, dto));
    }

    @GetMapping("/chat-rooms/{chatRoomId}")
    public ApiResponse<ChatRoomResDto.ChatRoomDto> getChatRoom(
            @PathVariable Long chatRoomId,
            @AuthenticationPrincipal Long userId
    ){
        return ApiResponse.onSuccess(ChatRoomSuccessCode.GET_CHAT_ROOM_SUCCESS, chatRoomQueryService.getChatRoom(chatRoomId, userId));
    }

    @GetMapping("/chat-rooms")
    public ApiResponse<List<ChatRoomResDto.ChatRoomDto>> getChatRooms(
            @AuthenticationPrincipal Long userId
    ) {
        return ApiResponse.onSuccess(ChatRoomSuccessCode.GET_CHAT_ROOMS_SUCCESS, chatRoomQueryService.getChatRooms(userId));
    }
}
