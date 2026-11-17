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
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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
        enrichChatRooms(List.of(response), userId);

        return response;
    }

    @Override
    public List<ChatRoomResDto.ChatRoomDto> getChatRooms(Long userId) {

        List<ChatRoomResDto.ChatRoomDto> chatRooms =
                chatParticipantRepository.findAllChatRoomsByUserId(userId);

        // 각 채팅방에 마지막 메시지 정보 추가
        enrichChatRooms(chatRooms, userId);

        return chatRooms;
    }

    private void enrichChatRooms(
            List<ChatRoomResDto.ChatRoomDto> chatRooms,
            Long userId
    ) {
        if (chatRooms.isEmpty()) {
            return;
        }

        List<Long> chatRoomIds = chatRooms.stream()
                .map(ChatRoomResDto.ChatRoomDto::getChatRoomId)
                .distinct()
                .toList();

        Map<Long, ChatMessageRepository.LatestMessageView> latestMessageMap =
                chatMessageRepository.findLatestMessages(chatRoomIds)
                        .stream()
                        .collect(Collectors.toMap(
                                ChatMessageRepository.LatestMessageView::getChatRoomId,
                                Function.identity()
                        ));

        Map<Long, Long> unreadCountMap =
                chatMessageRepository.findUnreadCounts(chatRoomIds, userId)
                        .stream()
                        .collect(Collectors.toMap(
                                ChatMessageRepository.UnreadCountView::getChatRoomId,
                                ChatMessageRepository.UnreadCountView::getUnreadCount
                        ));

        for (ChatRoomResDto.ChatRoomDto dto : chatRooms) {

            ChatMessageRepository.LatestMessageView latestMessage =
                    latestMessageMap.get(dto.getChatRoomId());

            if (latestMessage != null) {
                dto.updateLastMessage(
                        latestMessage.getContent(),
                        latestMessage.getCreatedAt()
                );
            }

            dto.updateUnreadCount(
                    unreadCountMap.getOrDefault(
                            dto.getChatRoomId(),
                            0L
                    )
            );
        }
    }
}
