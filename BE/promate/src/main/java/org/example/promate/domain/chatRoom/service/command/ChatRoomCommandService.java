package org.example.promate.domain.chatRoom.service.command;

import org.example.promate.domain.chatRoom.dto.req.ChatReportReqDto;
import org.example.promate.domain.chatRoom.dto.res.ChatRoomResDto;

public interface ChatRoomCommandService {
    ChatRoomResDto.CreatedChatRoomDto createChatRoom(Long recruitmentId, Long userId);
    ChatRoomResDto.LeavedChatRoomDto leaveChatRoom(Long chatRoomId, Long userId);
    ChatRoomResDto.ReportedChatRoomDto reportChatRoom(Long chatRoomId, Long userId, ChatReportReqDto.ReportChatRoom dto);
}
