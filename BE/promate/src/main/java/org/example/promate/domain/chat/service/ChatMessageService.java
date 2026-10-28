package org.example.promate.domain.chat.service;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.chat.dto.ChatMessageRequest;
import org.example.promate.domain.chat.dto.ChatMessageResponse;
import org.example.promate.domain.chat.entity.ChatMessage;
import org.example.promate.domain.chat.repository.ChatMessageRepository;
import org.example.promate.domain.user.entity.User;
import org.example.promate.domain.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatMessageService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

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

        if (!chatRoom.isParticipant(userId)) {
            throw new RuntimeException(
                    "채팅방 참여자가 아닙니다."
            );
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
}