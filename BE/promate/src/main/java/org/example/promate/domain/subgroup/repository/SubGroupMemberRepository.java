package org.example.promate.domain.subgroup.repository;

import org.example.promate.domain.subgroup.entity.SubGroupMember;
import org.example.promate.domain.subgroup.enums.SubGroupRole;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubGroupMemberRepository extends JpaRepository<SubGroupMember, Long> {
    boolean existsBySubGroupIdAndUserId(Long subGroupId, Long userId);

    boolean existsBySubGroupIdAndUserIdAndRole(Long subgroupId, Long userId, SubGroupRole role);

    void deleteAllBySubGroupId(Long subgroupId);

    Optional<SubGroupMember> findBySubGroupIdAndUserId(Long subgroupId, Long userId);

    @EntityGraph(attributePaths = {"user"})
    List<SubGroupMember> findAllBySubGroupId(Long subgroupId);
}
