package org.example.promate.domain.project.repository;

import org.example.promate.domain.project.entity.ProjectInvite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectInviteRepository extends JpaRepository<ProjectInvite, Long> {

    Optional<ProjectInvite> findByToken(String token);

    Optional<ProjectInvite> findByProjectIdAndIsActiveTrue(Long projectId);
}