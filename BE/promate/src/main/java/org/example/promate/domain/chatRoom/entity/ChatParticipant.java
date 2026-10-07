package org.example.promate.domain.chatRoom.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.example.promate.domain.user.entity.User;
import org.example.promate.global.entity.BaseTimeEntity;

@Entity
@Getter
@SuperBuilder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "chat_participant",
        uniqueConstraints = {   //chatRoom-participant 조합 중복 불가
                @UniqueConstraint(
                        name = "uk_chat_participant_room_user",
                        columnNames = {"chat_room_id", "participant_id"}
                )
        }
)
public class ChatParticipant extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "is_visible", nullable = false)
    @Builder.Default
    private boolean visible = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private User participant;


    public void leave() {
        this.visible = false;
    }

    public void show() {
        this.visible = true;
    }
}