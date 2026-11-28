package org.example.promate.domain.chatRoom.service.query;

import org.example.promate.domain.chatRoom.dto.res.ChatRoomResDto;

import java.util.List;

public interface ChatRoomQueryService {
    ChatRoomResDto.ChatRoomDto getChatRoom(Long chatRoomId, Long userId);
    List<ChatRoomResDto.ChatRoomDto> getChatRooms(Long userId);
}
