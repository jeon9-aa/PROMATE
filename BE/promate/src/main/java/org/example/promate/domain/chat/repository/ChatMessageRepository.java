package org.example.promate.domain.chat.repository;

import org.example.promate.domain.chat.entity.ChatMessage;
import org.example.promate.domain.chatRoom.entity.ChatParticipant;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 1. 채팅방의 가장 최근 메시지 개별 조회
    Optional<ChatMessage> findTopByChatRoom_IdOrderByCreatedAtDescIdDesc(
            Long chatRoomId
    );

    // 2. 이전 메시지 개별 조회 (sender N+1 방지)
    @EntityGraph(attributePaths = {"sender"})
    List<ChatMessage> findByChatRoom_IdOrderByCreatedAtAscIdAsc(
            Long chatRoomId
    );

    // 3. 읽지 않은 메시지 수 개별 조회
    long countByChatRoom_IdAndIdGreaterThanAndSender_IdNot(
            Long chatRoomId,
            Long lastReadMessageId,
            Long userId
    );

    // 4. 마지막 메시지 조회 결과 인터페이스
    interface LatestMessageView {
        Long getChatRoomId();
        String getContent();
        LocalDateTime getCreatedAt();
    }

    // 5. 읽지 않은 메시지 수 조회 결과 인터페이스
    interface UnreadCountView {
        Long getChatRoomId();
        Long getUnreadCount();
    }

    // 6. 여러 채팅방의 마지막 메시지 일괄 조회
    @Query("""
        SELECT
            m.chatRoom.id AS chatRoomId,
            m.content AS content,
            m.createdAt AS createdAt
        FROM ChatMessage m
        WHERE m.chatRoom.id IN :chatRoomIds
          AND NOT EXISTS (
              SELECT newer.id
              FROM ChatMessage newer
              WHERE newer.chatRoom = m.chatRoom
                AND (
                    newer.createdAt > m.createdAt
                    OR (
                        newer.createdAt = m.createdAt
                        AND newer.id > m.id
                    )
                )
          )
    """)
    List<LatestMessageView> findLatestMessages(
            @Param("chatRoomIds") List<Long> chatRoomIds
    );

    // 7. 여러 채팅방의 unreadCount 일괄 조회
    @Query("""
        SELECT
            m.chatRoom.id AS chatRoomId,
            COUNT(m.id) AS unreadCount
        FROM ChatMessage m, ChatParticipant cp
        WHERE m.chatRoom.id IN :chatRoomIds
          AND cp.chatRoom = m.chatRoom
          AND cp.participant.id = :userId
          AND m.sender.id <> :userId
          AND m.id > cp.lastReadMessageId
        GROUP BY m.chatRoom.id
    """)
    List<UnreadCountView> findUnreadCounts(
            @Param("chatRoomIds") List<Long> chatRoomIds,
            @Param("userId") Long userId
    );
}
