package org.example.promate.domain.subgroup.repository;

import jakarta.persistence.LockModeType;
import org.example.promate.domain.subgroup.entity.SubGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubGroupRepository extends JpaRepository<SubGroup, Long> {
    List<SubGroup> findAllByProjectId(Long projectId);
    Optional<SubGroup> findByIdAndProjectId(Long subgroupId, Long projectId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT sg
        FROM SubGroup sg
        WHERE sg.id = :subgroupId
          AND sg.project.id = :projectId
    """)
    Optional<SubGroup> findByIdAndProjectIdForUpdate(
            @Param("subgroupId") Long subgroupId,
            @Param("projectId") Long projectId
    );

    boolean existsByIdAndProjectId(Long subgroupId, Long projectId);
}
