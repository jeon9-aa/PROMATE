package org.example.promate.domain.chat.repository;

import org.example.promate.domain.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Optional<ChatMessage> findTopByChatRoom_IdOrderByCreatedAtDescIdDesc(Long chatRoomId); // 채팅방의 가장 최근 메시지 조회

    List<ChatMessage> findByChatRoom_IdOrderByCreatedAtAscIdAsc(Long chatRoomId); // 채팅방의 이전 메시지 전체 조회, 오래된 메시지 먼저(오름차순)

    long countByChatRoom_IdAndIdGreaterThanAndSender_IdNot(
            Long chatRoomId,
            Long lastReadMessageId,
            Long userId
    ); // 내가 읽지 않은 메시지의 수
}
