package org.example.promate.domain.chatRoom.repository;

import org.example.promate.domain.chatRoom.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    @Query("""
        SELECT CASE WHEN COUNT(cr) > 0 THEN true ELSE false END
        FROM ChatRoom cr
        WHERE cr.recruit.id = :recruitId
          AND EXISTS (
              SELECT cp1.id
              FROM ChatParticipant cp1
              WHERE cp1.chatRoom.id = cr.id
                AND cp1.participant.id = :requesterId
          )
          AND EXISTS (
              SELECT cp2.id
              FROM ChatParticipant cp2
              WHERE cp2.chatRoom.id = cr.id
                AND cp2.participant.id = :leaderId
          )
    """)
    boolean existsChatRoom(@Param("recruitId") Long recruitId, @Param("requesterId") Long requesterId, @Param("leaderId") Long leaderId);
}