package org.example.promate.domain.chatRoom.converter;


import org.example.promate.domain.chatRoom.dto.req.ChatReportReqDto;
import org.example.promate.domain.chatRoom.dto.res.ChatRoomResDto;
import org.example.promate.domain.chatRoom.entity.ChatParticipant;
import org.example.promate.domain.chatRoom.entity.ChatRoom;
import org.example.promate.domain.chatRoom.entity.ChatRoomReport;
import org.example.promate.domain.recruit.entity.Recruit;
import org.example.promate.domain.user.entity.User;

public class ChatRoomConverter {

    public static ChatRoom toChatRoom(Recruit recruit) {
        return ChatRoom.builder()
                .recruit(recruit)
                .build();
    }

    public static ChatParticipant toChatParticipant(ChatRoom chatRoom, User participant) {
        return ChatParticipant.builder()
                .chatRoom(chatRoom)
                .participant(participant)
                .build();
    }

    public static ChatRoomResDto.CreatedChatRoomDto toCreatedChatRoomDto(ChatRoom chatRoom) {
        return ChatRoomResDto.CreatedChatRoomDto.builder()
                .chatRoomId(chatRoom.getId())
                .build();
    }

    public static ChatRoomResDto.LeavedChatRoomDto toLeavedChatRoomDto(ChatRoom chatRoom) {
        return ChatRoomResDto.LeavedChatRoomDto.builder()
                .chatRoomId(chatRoom.getId())
                .build();
    }

    public static ChatRoomReport toChatRoomReport(ChatRoom chatRoom, User reporter, User reportedUser, ChatReportReqDto.ReportChatRoom dto) {
        return ChatRoomReport.builder()
                .chatRoom(chatRoom)
                .reporter(reporter)
                .reportedUser(reportedUser)
                .detail(dto.getDetail())
                .build();
    }

    public static ChatRoomResDto.ReportedChatRoomDto toReportedChatRoomDto(ChatRoomReport report) {
        return ChatRoomResDto.ReportedChatRoomDto.builder()
                .reportId(report.getId())
                .chatRoomId(report.getChatRoom().getId())
                .createdAt(report.getCreatedAt())
                .build();
    }

    public static ChatRoomResDto.ChatRoomDto toChatRoomDto(ChatRoom chatRoom, User chatPartner) {
        Recruit recruit = chatRoom.getRecruit();

        return ChatRoomResDto.ChatRoomDto.builder()
                .chatRoomId(chatRoom.getId())
                .recruitId(recruit.getId())
                .recruitTitle(recruit.getTitle())
                .chatPartnerId(chatPartner.getId())
                .chatPartnerProfileImageUrl(chatPartner.getProfileImageUrl())
                .build();
    }
}


