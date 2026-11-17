package org.example.promate.domain.chatRoom.repository;

import org.example.promate.domain.chatRoom.dto.res.ChatRoomResDto;
import org.example.promate.domain.chatRoom.entity.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {

    Optional<ChatParticipant> findByChatRoom_IdAndParticipant_Id(Long chatRoomId, Long participantId);

    Optional<ChatParticipant> findByChatRoom_IdAndParticipant_IdNot(Long chatRoomId, Long participantId);

    // N+1 문제 해결을 위한 DTO Projection
    @Query("SELECT new org.example.promate.domain.chatRoom.dto.res.ChatRoomResDto$ChatRoomDto(cr.id, r.id, r.title, partner.id, partner.profileImageUrl) " +
            "FROM ChatParticipant cp " +
            "JOIN cp.chatRoom cr " +
            "JOIN cr.recruit r " +
            "JOIN ChatParticipant otherCp " +
            "ON otherCp.chatRoom = cr " +
            "AND otherCp.participant.id <> :userId " +
            "JOIN otherCp.participant partner " +
            "WHERE cp.participant.id = :userId " +
            "AND cp.visible = true")
    List<ChatRoomResDto.ChatRoomDto> findAllChatRoomsByUserId(@Param("userId") Long userId);
}
