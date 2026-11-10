package org.example.promate.domain.subgroup.service.query;

import org.example.promate.domain.subgroup.dto.res.SubGroupResponseDto;

import java.util.List;

public interface SubGroupQueryService {
    List<SubGroupResponseDto.SubGroupInfo> getAll(Long userId, Long projectId);
    SubGroupResponseDto.SubGroupDetail getDetail(Long userId, Long projectId, Long subgroupId);
    List<SubGroupResponseDto.SubGroupMemberInfo> getSubGroupMembers(Long userId, Long projectId, Long subgroupId);
}
