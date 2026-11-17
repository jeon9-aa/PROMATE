package org.example.promate.domain.chatRoom.service.query;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.chatRoom.code.ChatRoomErrorCode;
import org.example.promate.domain.chatRoom.converter.ChatRoomConverter;
import org.example.promate.domain.chatRoom.dto.res.ChatRoomResDto;
import org.example.promate.domain.chatRoom.entity.ChatParticipant;
import org.example.promate.domain.chatRoom.entity.ChatRoom;
import org.example.promate.domain.chatRoom.exception.ChatRoomException;
import org.example.promate.domain.chatRoom.repository.ChatParticipantRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatRoomQueryServiceImpl implements ChatRoomQueryService {
    private final ChatParticipantRepository chatParticipantRepository;

    @Override
    public ChatRoomResDto.ChatRoomDto getChatRoom(Long chatRoomId, Long userId) {

        ChatParticipant participant = chatParticipantRepository.findByChatRoom_IdAndParticipant_Id(chatRoomId, userId)
                .orElseThrow(() -> new ChatRoomException(ChatRoomErrorCode.NOT_CHAT_ROOM_PARTICIPANT));

        // 채팅방을 나간 사용자는 상세 조회 불가
        if (!participant.isVisible()) {
            throw new ChatRoomException(ChatRoomErrorCode.NOT_CHAT_ROOM_PARTICIPANT);
        }

        ChatRoom chatRoom = participant.getChatRoom();

        ChatParticipant chatPartner = chatParticipantRepository.findByChatRoom_IdAndParticipant_IdNot(chatRoomId, userId)
                .orElseThrow(() -> new ChatRoomException(ChatRoomErrorCode.CHAT_PARTNER_NOT_FOUND));

        return ChatRoomConverter.toChatRoomDto(chatRoom, chatPartner.getParticipant());
    }

    @Override
    public List<ChatRoomResDto.ChatRoomDto> getChatRooms(Long userId) {
        return chatParticipantRepository.findAllChatRoomsByUserId(userId);
    }
}