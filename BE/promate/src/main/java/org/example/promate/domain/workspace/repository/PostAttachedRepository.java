package org.example.promate.domain.workspace.repository;

import org.example.promate.domain.workspace.entity.PostAttached;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostAttachedRepository extends JpaRepository<PostAttached, Long> {

    void deleteByPostId(Long postId);
}
