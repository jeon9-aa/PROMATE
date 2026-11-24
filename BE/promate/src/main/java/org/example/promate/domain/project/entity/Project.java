package org.example.promate.domain.project.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.example.promate.domain.project.dto.UpdateProjectRequestDto;
import org.example.promate.domain.project.enums.ProjectStatus;
import org.example.promate.domain.recruit.code.RecruitErrorCode;
import org.example.promate.domain.recruit.dto.request.RecruitUpdateRequest;
import org.example.promate.domain.recruit.entity.Recruit;
import org.example.promate.domain.recruit.enums.Category;
import org.example.promate.domain.subgroup.entity.SubGroup;
import org.example.promate.domain.user.entity.User;
import org.example.promate.domain.workspace.entity.*;
import org.example.promate.global.ApiPayload.exception.GeneralException;
import org.example.promate.global.entity.BaseEntity;
import org.example.promate.global.entity.BaseTimeEntity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@SuperBuilder
@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "project")
public class Project extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category", nullable = false)
    @Enumerated(EnumType.STRING)
    private Category category;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ProjectStatus status;       //PREPARING, ACTIVE, COMPLETED, CANCELED

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @Column(name = "joined_count", nullable = false)
    private int joinedCount;

    @Column(name = "total_slots", nullable = false)
    private int totalSlots;

    //mapping
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_id")
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruit_id")
    private Recruit recruit;

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Member> members = new ArrayList<>();

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Task> tasks = new ArrayList<>();

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Schedule> events = new ArrayList<>();

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Post> posts = new ArrayList<>();

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    @Builder.Default
    private List<SubGroup> subGroups = new ArrayList<>();

    public void updateStatus(ProjectStatus status) {
        this.status = status;
    }

    public void disconnectRecruit() {
        if (this.recruit != null) {
            // 1. 반대편(Recruit) 객체의 참조를 먼저 제거
            this.recruit.disconnectProject();

            // 2. 본인(Project)의 참조 제거
            this.recruit = null;
        }
    }

    // 프로젝트 인원 증감
    public void increaseJoinedCount() {
        this.joinedCount++;
    }

    public void decreaseJoinedCount() {
        if (this.joinedCount > 0) {
            this.joinedCount--;
        }
    }

    public void update(RecruitUpdateRequest request) {
        this.title = request.title();
        this.description = request.description();
        if (request.thumbnailUrl() != null
                && !request.thumbnailUrl().isBlank()) {
            this.thumbnailUrl = request.thumbnailUrl();
        }
        this.category = request.category();
        this.startDate = request.startDate();
        this.endDate = request.endDate();

        if(request.totalSlots() < 1 || request.totalSlots() < this.getJoinedCount()){
            throw new GeneralException(RecruitErrorCode.INVALID_RECRUIT_PARTICIPANTS);
        }

        this.totalSlots = request.totalSlots();
    }

    public void update(UpdateProjectRequestDto request) {
        this.title = request.getTitle();
        this.description = request.getDescription();
        if (request.getThumbnailUrl() != null
                && !request.getThumbnailUrl().isBlank()) {
            this.thumbnailUrl = request.getThumbnailUrl();
        }
        this.category = request.getCategory();
        this.startDate = request.getStartDate();
        this.endDate = request.getEndDate();

        if(request.getTotalSlots() < 1 || request.getTotalSlots() < this.getJoinedCount()){
            throw new GeneralException(RecruitErrorCode.INVALID_RECRUIT_PARTICIPANTS);
        }
        this.totalSlots = request.getTotalSlots();
    }
}
