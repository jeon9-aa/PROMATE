package org.example.promate.domain.subgroup.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.example.promate.domain.subgroup.enums.SubGroupRole;
import org.example.promate.domain.user.entity.User;
import org.example.promate.global.entity.BaseTimeEntity;

@Entity
@Getter
@SuperBuilder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name="subgroup_member")
public class SubGroupMember extends BaseTimeEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="role", nullable = false)
    @Enumerated(EnumType.STRING)
    private SubGroupRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="subgroup_id", nullable = false)
    private SubGroup subGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable = false)
    private User user;
}
