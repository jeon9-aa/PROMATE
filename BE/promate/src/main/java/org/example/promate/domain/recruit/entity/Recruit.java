package org.example.promate.domain.recruit.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.example.promate.domain.apply.entity.Apply;
import org.example.promate.domain.project.dto.UpdateProjectRequestDto;
import org.example.promate.domain.project.entity.Project;
import org.example.promate.domain.recruit.code.RecruitErrorCode;
import org.example.promate.domain.recruit.enums.Category;
import org.example.promate.domain.recruit.enums.RecruitStatus;
import org.example.promate.domain.user.entity.User;
import org.example.promate.global.ApiPayload.exception.GeneralException;
import org.example.promate.global.entity.BaseEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@SuperBuilder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name="recruit")
public class Recruit extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="category", nullable = false)
    @Enumerated(EnumType.STRING)
    private Category category;

    @Column(name="title", nullable = false)
    private String title;

    @Column(name="description", nullable = false)
    private String description;

    @Column(name="status", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RecruitStatus status = RecruitStatus.RECRUITING;

    @Column(name="joined_count", nullable = false)
    private int joinedCount;

    @Column(name="total_slots", nullable = false)
    private int totalSlots;

    @Column(name = "thumbnail_url", nullable = true, columnDefinition = "TEXT")
    private String thumbnailUrl;

    //mapping
    @OneToMany(mappedBy = "recruit", fetch = FetchType.LAZY)
    @Builder.Default
    private List<RecruitWishlist> recruitWishlists = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable = false)
    private User user;

    //모집글 1개당 1개의 프로젝트로 수정했습니다
    //모집글 삭제 -> 지원서 다수 삭제 , 임시 프로젝트 1개 삭제 -> 프로젝트의 멤버 다수 삭제
    @OneToOne(mappedBy = "recruit", cascade = CascadeType.ALL, orphanRemoval = true)
    private Project project;

    @OneToMany(mappedBy = "recruit", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Apply> applies = new ArrayList<>();

    public void update(
            String title,
            String description,
            String thumbnailUrl,
            Category category,
            int totalSlots
    ) {
        this.title = title;
        this.description = description;

        if (thumbnailUrl != null && !thumbnailUrl.isBlank()) {
            this.thumbnailUrl = thumbnailUrl;
        }
        if (category != null) {
            this.category = category;
        }

        if(totalSlots < 1 || totalSlots < this.getJoinedCount()){
            throw new GeneralException(RecruitErrorCode.INVALID_RECRUIT_PARTICIPANTS);
        }

        this.totalSlots = totalSlots;
    }

    public void delete(){
        super.performDelete();
    }

    public void increaseJoinedCount() {
        this.joinedCount++;
    }

    public void decreaseJoinedCount(){
        this.joinedCount--;
    }

    public void updateStatus(RecruitStatus status){
        this.status = status;
    }

    public void disconnectProject(){
        this.project = null;
    }

    public void update(UpdateProjectRequestDto request){
        this.title = request.getTitle();
        this.description = request.getDescription();

        if (request.getThumbnailUrl() != null && !request.getThumbnailUrl().isBlank()) {
            this.thumbnailUrl = request.getThumbnailUrl();
        }

        if (request.getCategory() != null) {
            this.category = request.getCategory();
        }

        if(request.getTotalSlots() < 1 || request.getTotalSlots() < this.getJoinedCount()){
            throw new GeneralException(RecruitErrorCode.INVALID_RECRUIT_PARTICIPANTS);
        }

        this.totalSlots = request.getTotalSlots();
    }
}
