package org.example.promate.domain.chat.service;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.chat.dto.ChatMessageRequest;
import org.example.promate.domain.chat.dto.ChatMessageResponse;
import org.example.promate.domain.chat.entity.ChatMessage;
import org.example.promate.domain.chat.repository.ChatMessageRepository;
import org.example.promate.domain.chatRoom.entity.ChatParticipant;
import org.example.promate.domain.chatRoom.entity.ChatRoom;
import org.example.promate.domain.chatRoom.repository.ChatParticipantRepository;
import org.example.promate.domain.chatRoom.repository.ChatRoomRepository;
import org.example.promate.domain.user.entity.User;
import org.example.promate.domain.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatMessageService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ChatParticipantRepository chatParticipantRepository;


    // 에러코드 추후 정리 예정!!!!!!!!!

    @Transactional
    public ChatMessageResponse sendMessage(
            Long chatRoomId,
            Long userId,
            ChatMessageRequest request
    ) {

        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() ->
                        new RuntimeException("채팅방을 찾을 수 없습니다.")
                );

        User sender = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("사용자를 찾을 수 없습니다.")
                );

        ChatParticipant participant = chatParticipantRepository
                .findByChatRoom_IdAndParticipant_Id(chatRoomId, userId)
                .orElseThrow(() ->
                        new RuntimeException("채팅방 참여자가 아닙니다.")
                );

        if (!participant.isVisible()) {
            throw new RuntimeException("채팅방을 나간 사용자는 메시지를 보낼 수 없습니다.");
        }
        ChatMessage message =
                ChatMessage.builder()
                        .chatRoom(chatRoom)
                        .sender(sender)
                        .content(request.getContent())
                        .build();

        ChatMessage saved =
                chatMessageRepository.save(message);

        return ChatMessageResponse.builder()
                .messageId(saved.getId())
                .chatRoomId(chatRoom.getId())
                .senderId(sender.getId())
                .senderName(sender.getName())
                .senderProfileImageUrl(
                        sender.getProfileImageUrl()
                )
                .content(saved.getContent())
                .createdAt(saved.getCreatedAt())
                .build();
    }


    public List<ChatMessageResponse> getMessages(
            Long chatRoomId,
            Long userId
    ) {

        // 1. 채팅방 존재 여부 확인
        chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() ->
                        new RuntimeException("채팅방을 찾을 수 없습니다.")
                );

        // 2. 채팅방 참여자 검증
        ChatParticipant participant = chatParticipantRepository
                .findByChatRoom_IdAndParticipant_Id(chatRoomId, userId)
                .orElseThrow(() ->
                        new RuntimeException("채팅방 참여자가 아닙니다.")
                );

        // 3. 나간 사용자 조회 제한
        if (!participant.isVisible()) {
            throw new RuntimeException(
                    "채팅방을 나간 사용자는 메시지를 조회할 수 없습니다."
            );
        }

        // 4. 이전 메시지 조회
        List<ChatMessage> messages = chatMessageRepository
                .findByChatRoom_IdOrderByCreatedAtAscIdAsc(chatRoomId);

        // 5. Entity → DTO 변환
        return messages.stream()
                .map(message -> ChatMessageResponse.builder()
                        .messageId(message.getId())
                        .chatRoomId(message.getChatRoom().getId())
                        .senderId(message.getSender().getId())
                        .senderName(message.getSender().getName())
                        .senderProfileImageUrl(
                                message.getSender().getProfileImageUrl()
                        )
                        .content(message.getContent())
                        .createdAt(message.getCreatedAt())
                        .build()
                )
                .toList();
    }


    @Transactional
    public void markMessagesAsRead(Long chatRoomId, Long userId) {

        // 1. 채팅방 참여자 검증
        ChatParticipant participant = chatParticipantRepository
                .findByChatRoom_IdAndParticipant_Id(chatRoomId, userId)
                .orElseThrow(() ->
                        new RuntimeException("채팅방 참여자가 아닙니다.")
                );

        // 2. 나간 사용자 검증
        if (!participant.isVisible()) {
            throw new RuntimeException(
                    "채팅방을 나간 사용자는 메시지를 읽을 수 없습니다."
            );
        }

        // 3. 마지막 메시지 ID 확인 후 읽음 처리
        chatMessageRepository
                .findTopByChatRoom_IdOrderByCreatedAtDescIdDesc(chatRoomId)
                .ifPresent(message ->
                        participant.markAsRead(message.getId())
                );
    }


}