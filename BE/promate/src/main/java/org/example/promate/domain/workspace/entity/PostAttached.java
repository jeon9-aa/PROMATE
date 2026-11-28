package org.example.promate.domain.workspace.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.example.promate.domain.workspace.enums.AttachedType;
import org.example.promate.global.entity.BaseTimeEntity;


@Entity
@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
@Table(name="post_attached")
public class PostAttached extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(name="attachedType", nullable = false)
    @Enumerated(EnumType.STRING)
    private AttachedType attachedType;

    @Column(name="attached_url", nullable = false)
    private String attachedUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

}