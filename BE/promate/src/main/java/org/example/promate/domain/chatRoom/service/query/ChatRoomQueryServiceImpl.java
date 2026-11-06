
package org.example.promate.domain.chatRoom.service.query;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.chat.entity.ChatMessage;
import org.example.promate.domain.chat.repository.ChatMessageRepository;
import org.example.promate.domain.chatRoom.code.ChatRoomErrorCode;
import org.example.promate.domain.chatRoom.converter.ChatRoomConverter;
import org.example.promate.domain.chatRoom.dto.res.ChatRoomResDto;
import org.example.promate.domain.chatRoom.entity.ChatParticipant;
import org.example.promate.domain.chatRoom.entity.ChatRoom;
import org.example.promate.domain.chatRoom.exception.ChatRoomException;
import org.example.promate.domain.chatRoom.repository.ChatParticipantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatRoomQueryServiceImpl implements ChatRoomQueryService {

    private final ChatParticipantRepository chatParticipantRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Override
    public ChatRoomResDto.ChatRoomDto getChatRoom(Long chatRoomId, Long userId) {

        ChatParticipant participant = chatParticipantRepository
                .findByChatRoom_IdAndParticipant_Id(chatRoomId, userId)
                .orElseThrow(() ->
                        new ChatRoomException(ChatRoomErrorCode.NOT_CHAT_ROOM_PARTICIPANT)
                );

        if (!participant.isVisible()) {
            throw new ChatRoomException(ChatRoomErrorCode.NOT_CHAT_ROOM_PARTICIPANT);
        }

        ChatRoom chatRoom = participant.getChatRoom();

        ChatParticipant chatPartner = chatParticipantRepository
                .findByChatRoom_IdAndParticipant_IdNot(chatRoomId, userId)
                .orElseThrow(() ->
                        new ChatRoomException(ChatRoomErrorCode.CHAT_PARTNER_NOT_FOUND)
                );

        ChatRoomResDto.ChatRoomDto response =
                ChatRoomConverter.toChatRoomDto(
                        chatRoom,
                        chatPartner.getParticipant()
                );

        // 마지막 메시지 추가
        setLastMessage(response);
        setUnreadCount(response, userId); // 안 읽은 메시지 수

        return response;
    }

    @Override
    public List<ChatRoomResDto.ChatRoomDto> getChatRooms(Long userId) {

        List<ChatRoomResDto.ChatRoomDto> chatRooms =
                chatParticipantRepository.findAllChatRoomsByUserId(userId);

        // 각 채팅방에 마지막 메시지 정보 추가
        chatRooms.forEach(dto -> {
            setLastMessage(dto);
            setUnreadCount(dto, userId);
        });

        return chatRooms;
    }

    private void setLastMessage(ChatRoomResDto.ChatRoomDto dto) {

        chatMessageRepository
                .findTopByChatRoom_IdOrderByCreatedAtDescIdDesc(dto.getChatRoomId())
                .ifPresent(message ->
                        dto.updateLastMessage(
                                message.getContent(),
                                message.getCreatedAt()
                        )
                );
    }

    private void setUnreadCount(
            ChatRoomResDto.ChatRoomDto dto,
            Long userId
    ) {
        ChatParticipant participant = chatParticipantRepository
                .findByChatRoom_IdAndParticipant_Id(
                        dto.getChatRoomId(), userId
                )
                .orElseThrow(() ->
                        new ChatRoomException(
                                ChatRoomErrorCode.NOT_CHAT_ROOM_PARTICIPANT)
                );

        long unreadCount = chatMessageRepository
                .countByChatRoom_IdAndIdGreaterThanAndSender_IdNot(
                        dto.getChatRoomId(),
                        participant.getLastReadMessageId(),
                        userId
                );

        dto.updateUnreadCount(unreadCount);
    }
}
