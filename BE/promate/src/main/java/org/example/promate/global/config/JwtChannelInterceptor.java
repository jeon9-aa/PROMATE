
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

        if (StompCommand.CONNECT.equals(command)) {

            String authorization =
                    accessor.getFirstNativeHeader("Authorization");

            if (authorization == null ||
                    !authorization.startsWith("Bearer ")) {
                throw new IllegalArgumentException("JWT 토큰이 없습니다.");
            }

            String token = authorization.substring(7);

            if (!jwtProvider.validateToken(token)
                    || jwtProvider.isRefreshToken(token)) {
                throw new IllegalArgumentException("유효하지 않은 Access Token입니다.");
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

        if (StompCommand.SEND.equals(command)
                || StompCommand.SUBSCRIBE.equals(command)) {

            Principal principal = accessor.getUser();

            if (principal == null) {
                throw new IllegalArgumentException("인증되지 않은 사용자입니다.");
            }

            String destination = accessor.getDestination();

            if (destination == null) {
                throw new IllegalArgumentException("목적지가 없습니다.");
            }

            String prefix = StompCommand.SEND.equals(command)
                    ? "/app/chat/"
                    : "/topic/chat/";

            if (!destination.startsWith(prefix)) {
                throw new IllegalArgumentException("허용되지 않은 목적지입니다.");
            }

            String suffix = destination.substring(prefix.length());

            if (StompCommand.SEND.equals(command)) {
                if (!suffix.endsWith("/messages")) {
                    throw new IllegalArgumentException("잘못된 메시지 경로입니다.");
                }
                suffix = suffix.substring(0, suffix.length() - "/messages".length());
            }

            Long chatRoomId;

            try {
                chatRoomId = Long.valueOf(suffix);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("잘못된 채팅방 ID입니다.");
            }

            Long userId = Long.valueOf(principal.getName());

            ChatParticipant participant = chatParticipantRepository
                    .findByChatRoom_IdAndParticipant_Id(chatRoomId, userId)
                    .orElseThrow(() ->
                            new IllegalArgumentException("채팅방 참여자가 아닙니다.")
                    );

            if (!participant.isVisible()) {
                throw new IllegalArgumentException("채팅방을 나간 사용자입니다.");
            }
        }

        return message;
    }
}
