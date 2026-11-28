package org.example.promate.domain.workspace.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.example.promate.domain.project.entity.Member;
import org.example.promate.domain.project.entity.Project;
import org.example.promate.domain.workspace.dto.req.PostReqDto;
import org.example.promate.domain.workspace.enums.PostType;
import org.example.promate.global.entity.BaseTimeEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
@Table(name = "post")
public class Post extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "post_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private PostType postType;

    @Column(name="is_pinned")
    private boolean isPinned;

    //mapping
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "writer_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PostAttached> attachedList = new ArrayList<>();

    @OneToMany(mappedBy="post", fetch=FetchType.LAZY)
    @Builder.Default
    private List<Comment> commentsList = new ArrayList<>();

    // 첨부파일 교체: 기존 데이터 전체 삭제 후 새로 등록
    public void updateAttachedList(List<PostAttached> newAttachedList) {
        this.attachedList.clear();
        if (newAttachedList != null) {
            this.attachedList.addAll(newAttachedList);
        }
    }

    public void update(PostReqDto.UpdatePostDto dto) {
        this.title = dto.getTitle();
        this.content = dto.getContent();
        this.postType = dto.getPostType();
        this.isPinned = dto.isPinned();
    }

}
