
package org.example.promate.domain.subgroup.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.example.promate.domain.project.entity.Project;
import org.example.promate.domain.subgroup.code.SubGroupErrorCode;
import org.example.promate.domain.subgroup.enums.SubStatus;
import org.example.promate.domain.subgroup.exception.SubGroupException;
import org.example.promate.global.entity.BaseTimeEntity;

import java.time.LocalDate;

@Entity
@SuperBuilder
@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "subgroup")
public class SubGroup extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SubStatus status = SubStatus.RECRUITING;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "current_count", nullable = false)
    @Builder.Default
    private Integer currentCount = 0;

    // 소모임 시작일
    @Column(name = "start_date")
    private LocalDate startDate;

    // 소모임 종료일
    @Column(name = "end_date")
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    public void update(String name, String description, Integer capacity, LocalDate startDate, LocalDate endDate) {
        if (name != null) {
            this.name = name;
        }

        if (description != null) {
            this.description = description;
        }

        if (capacity != null) {
            this.capacity = capacity;
        }

        this.startDate = startDate;
        this.endDate = endDate;
    }

    public void complete() {
        this.status = SubStatus.COMPLETED;
    }

    public void recruit() {
        this.status = SubStatus.RECRUITING;
    }

    public void increaseCurrentCount() {
        this.currentCount++;
    }

    public void decreaseCurrentCount() {
        if (this.currentCount <= 1) {
            throw new SubGroupException(
                    SubGroupErrorCode.OVER_ONE_PEOPLE
            );
        }
        this.currentCount--;
    }
}
