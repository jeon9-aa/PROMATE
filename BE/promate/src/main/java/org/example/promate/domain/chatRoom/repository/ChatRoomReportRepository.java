package org.example.promate.domain.chatRoom.repository;

import org.example.promate.domain.chatRoom.entity.ChatRoomReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRoomReportRepository extends JpaRepository<ChatRoomReport, Long> {
}
