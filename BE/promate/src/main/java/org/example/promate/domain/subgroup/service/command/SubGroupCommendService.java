package org.example.promate.domain.subgroup.service.command;

import org.example.promate.domain.subgroup.dto.req.SubGroupRequestDto;
import org.example.promate.domain.subgroup.dto.res.SubGroupResponseDto;

public interface SubGroupCommendService {
    SubGroupResponseDto.CreatedSubGroup createSubGroup(Long userId, Long projectId, SubGroupRequestDto.CreateSubGroup dto);
    SubGroupResponseDto.UpdatedSubGroup updateSubGroup(Long userId, Long projectId, Long subgroupId, SubGroupRequestDto.UpdateSubGroup dto);
    void deleteSubGroup(Long userId, Long projectId, Long subgroupId);
    SubGroupResponseDto.JoinedSubGroup joinSubGroup(Long userId, Long projectId, Long subgroupId);
    void leaveSubGroup(Long userId, Long projectId, Long subgroupId);
}
