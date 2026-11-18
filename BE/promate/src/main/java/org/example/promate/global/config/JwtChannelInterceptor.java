package org.example.promate.global.config;

import lombok.RequiredArgsConstructor;
import org.example.promate.domain.chatRoom.entity.ChatParticipant;
import org.example.promate.domain.chatRoom.repository.ChatParticipantRepository;
import org.example.promate.global.jwt.JwtProvider;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import org.example.promate.domain.chat.code.ChatMessageErrorCode;
import org.example.promate.domain.chat.exception.ChatMessageException;
import org.example.promate.domain.chatRoom.code.ChatRoomErrorCode;
import org.example.promate.domain.chatRoom.exception.ChatRoomException;

import java.security.Principal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtProvider jwtProvider;
    private final ChatParticipantRepository chatParticipantRepository;

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel
    ) {
        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(message);

        StompCommand command = accessor.getCommand();

        // 1. STOMP 연결 시 JWT 인증
        if (StompCommand.CONNECT.equals(command)) {

            String authorization =
                    accessor.getFirstNativeHeader("Authorization");

            if (authorization == null ||
                    !authorization.startsWith("Bearer ")) {
                throw new ChatMessageException(
                        ChatMessageErrorCode.WEBSOCKET_UNAUTHORIZED
                );
            }

            String token = authorization.substring(7);

            if (!jwtProvider.validateToken(token)
                    || jwtProvider.isRefreshToken(token)) {
                throw new ChatMessageException(
                        ChatMessageErrorCode.WEBSOCKET_INVALID_TOKEN
                );
            }

            Long userId = jwtProvider.getUserId(token);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            String.valueOf(userId),
                            null,
                            List.of()
                    );

            accessor.setUser(authentication);
        }

        // 2. 메시지 전송 및 채팅방 구독 권한 검증
        if (StompCommand.SEND.equals(command)
                || StompCommand.SUBSCRIBE.equals(command)) {

            Principal principal = accessor.getUser();

            System.out.println(
                    "[STOMP] command=" + command
                            + ", destination=" + accessor.getDestination()
                            + ", user=" + (principal == null ? "null" : principal.getName())
            ); // 로그

            if (principal == null) {
                throw new ChatMessageException(
                        ChatMessageErrorCode.WEBSOCKET_UNAUTHORIZED
                );
            }

            String destination = accessor.getDestination();

            if (destination == null) {
                throw new ChatMessageException(
                        ChatMessageErrorCode.WEBSOCKET_INVALID_DESTINATION
                );
            }

            String prefix = StompCommand.SEND.equals(command)
                    ? "/app/chat/"
                    : "/topic/chat/";

            if (!destination.startsWith(prefix)) {
                throw new ChatMessageException(
                        ChatMessageErrorCode.WEBSOCKET_INVALID_DESTINATION
                );
            }

            String suffix = destination.substring(prefix.length());

            // SEND 경로: /app/chat/{chatRoomId}/messages
            if (StompCommand.SEND.equals(command)) {
                if (!suffix.endsWith("/messages")) {
                    throw new ChatMessageException(
                            ChatMessageErrorCode.WEBSOCKET_INVALID_DESTINATION
                    );
                }

                suffix = suffix.substring(
                        0,
                        suffix.length() - "/messages".length()
                );
            }

            Long chatRoomId;

            try {
                chatRoomId = Long.valueOf(suffix);
            } catch (NumberFormatException e) {
                throw new ChatMessageException(
                        ChatMessageErrorCode.WEBSOCKET_INVALID_DESTINATION
                );
            }

            Long userId = Long.valueOf(principal.getName());

            System.out.println(
                    "[STOMP] participant check: chatRoomId="
                            + chatRoomId + ", userId=" + userId
            ); // 로그

            
            // 3. 채팅방 참여자 검증
            ChatParticipant participant = chatParticipantRepository
                    .findByChatRoom_IdAndParticipant_Id(
                            chatRoomId,
                            userId
                    )
                    .orElseThrow(() ->
                            new ChatRoomException(
                                    ChatRoomErrorCode.NOT_CHAT_ROOM_PARTICIPANT
                            )
                    );

            // 4. 채팅방을 나간 사용자 검증
            if (!participant.isVisible()) {
                throw new ChatRoomException(
                        ChatRoomErrorCode.CHAT_ROOM_LEFT
                );
            }
        }

        return message;
    }
}
