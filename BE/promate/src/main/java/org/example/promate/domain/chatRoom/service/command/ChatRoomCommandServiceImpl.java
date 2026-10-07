package org.example.promate.domain.chatRoom.service.command;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.promate.domain.chatRoom.code.ChatRoomErrorCode;
import org.example.promate.domain.chatRoom.converter.ChatRoomConverter;
import org.example.promate.domain.chatRoom.dto.req.ChatReportReqDto;
import org.example.promate.domain.chatRoom.dto.res.ChatRoomResDto;
import org.example.promate.domain.chatRoom.entity.ChatParticipant;
import org.example.promate.domain.chatRoom.entity.ChatRoom;
import org.example.promate.domain.chatRoom.entity.ChatRoomReport;
import org.example.promate.domain.chatRoom.exception.ChatRoomException;
import org.example.promate.domain.chatRoom.repository.ChatParticipantRepository;
import org.example.promate.domain.chatRoom.repository.ChatRoomReportRepository;
import org.example.promate.domain.chatRoom.repository.ChatRoomRepository;
import org.example.promate.domain.recruit.code.RecruitErrorCode;
import org.example.promate.domain.recruit.entity.Recruit;
import org.example.promate.domain.recruit.repository.RecruitRepository;
import org.example.promate.domain.user.entity.User;
import org.example.promate.domain.user.exception.UserErrorCode;
import org.example.promate.domain.user.exception.UserException;
import org.example.promate.domain.user.repository.UserRepository;
import org.example.promate.global.ApiPayload.exception.GeneralException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ChatRoomCommandServiceImpl implements ChatRoomCommandService{
    private final RecruitRepository recruitRepository;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final ChatRoomReportRepository chatRoomReportRepository;

    @Override
    public ChatRoomResDto.CreatedChatRoomDto createChatRoom(Long recruitmentId, Long userId) {
        // 검증1: 모집글 검증
        Recruit recruit = recruitRepository.findById(recruitmentId)
                .orElseThrow(() -> new GeneralException(RecruitErrorCode.RECRUITMENT_NOT_FOUND));

        // 검증2: 로그인 사용자 검증
        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        // 모집글 작성자 불러오기
        User leader = recruit.getUser();

        // 검증3: 자기 자신과 채팅 불가능
        if (leader.getId().equals(requester.getId())) {
            throw new ChatRoomException(ChatRoomErrorCode.CANNOT_CHAT_WITH_SELF);
        }

        // 검증5: 이미 존재하는 채팅방인가
        if (chatRoomRepository.existsChatRoom(recruit.getId(), requester.getId(), leader.getId())) {
            throw new GeneralException(ChatRoomErrorCode.CHAT_ROOM_ALREADY_EXISTS);
        }

        ChatRoom chatRoom = ChatRoomConverter.toChatRoom(recruit);
        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);

        List<ChatParticipant> participants = List.of(
                ChatRoomConverter.toChatParticipant(savedChatRoom,requester),
                ChatRoomConverter.toChatParticipant(savedChatRoom,leader)
        );

        chatParticipantRepository.saveAll(participants);

        return ChatRoomConverter.toCreatedChatRoomDto(savedChatRoom);
    }


    @Override
    public ChatRoomResDto.LeavedChatRoomDto leaveChatRoom(Long chatRoomId, Long userId) {
        ChatParticipant participant = chatParticipantRepository.findByChatRoom_IdAndParticipant_Id(chatRoomId, userId)
                        .orElseThrow(() -> new ChatRoomException(ChatRoomErrorCode.NOT_CHAT_ROOM_PARTICIPANT));

        participant.leave();

        return ChatRoomConverter.toLeavedChatRoomDto(participant.getChatRoom());
    }

    @Override
    public ChatRoomResDto.ReportedChatRoomDto reportChatRoom(Long chatRoomId, Long userId, ChatReportReqDto.ReportChatRoom dto) {
        ChatParticipant reporterParticipant = chatParticipantRepository.findByChatRoom_IdAndParticipant_Id(chatRoomId, userId)
                        .orElseThrow(() -> new ChatRoomException(ChatRoomErrorCode.NOT_CHAT_ROOM_PARTICIPANT));

        ChatRoom chatRoom = reporterParticipant.getChatRoom();
        User reporter = reporterParticipant.getParticipant();

        ChatParticipant reportedParticipant = chatParticipantRepository.findByChatRoom_IdAndParticipant_IdNot(chatRoomId, userId)
                        .orElseThrow(() -> new ChatRoomException(ChatRoomErrorCode.CHAT_PARTNER_NOT_FOUND));

        User reportedUser = reportedParticipant.getParticipant();

        ChatRoomReport report = ChatRoomConverter.toChatRoomReport(chatRoom, reporter, reportedUser, dto);

        ChatRoomReport savedReport = chatRoomReportRepository.save(report);

        return ChatRoomConverter.toReportedChatRoomDto(savedReport);
    }
}
