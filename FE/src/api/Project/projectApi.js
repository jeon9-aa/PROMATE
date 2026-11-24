import apiClient from '../apiClient';
import { findProjectRecruitment } from './findProjectRecruitment';

export const getProjectSettings = async (projectId) => {
  const { data: projects } = await apiClient.get('/projects/me');
  let project = projects?.data?.find?.((item) => String(item.projectId) === String(projectId));
  if (project?.recruitmentId == null) {
    const { data: activities } = await apiClient.get('/projects/activity/me');
    const activity = activities?.data?.find?.((item) => String(item.projectId) === String(projectId));
    if (activity) project = { ...activity, ...project, recruitmentId: activity.recruitmentId };
  }
  const getDetail = async (id) => {
    const { data } = await apiClient.get(`/recruitments/${encodeURIComponent(id)}`);
    if (data?.isSuccess !== true || !data.data) throw new Error('프로젝트 소개를 불러오지 못했습니다.');
    return data.data;
  };
  if (project?.recruitmentId != null) {
    const recruitment = await getDetail(project.recruitmentId);
    if (recruitment.projectId != null && String(recruitment.projectId) !== String(projectId)) {
      throw new Error('프로젝트와 모집글의 연결 정보가 일치하지 않습니다.');
    }
    return {
      ...recruitment,
      projectId: project.projectId,
      recruitmentId: project.recruitmentId,
      recruitmentStatus: recruitment.status,
      status: project.projectStatus ?? project.status,
    };
  }
  const recruitment = await findProjectRecruitment(projectId, {
    getPage: async (page) => {
      const { data } = await apiClient.get('/recruitments/me', { params: { page, size: 20 } });
      return data?.data;
    },
    getDetail,
  });
  return { ...recruitment, recruitmentStatus: recruitment.status, status: project?.projectStatus ?? project?.status };
};

export const updateRecruitmentStatus = async (recruitmentId, status) => {
  const { data } = await apiClient.patch(`/recruitments/${encodeURIComponent(recruitmentId)}/status`, { status });
  if (data?.isSuccess === true) return data.data;
  throw new Error(data?.message || '모집 상태 변경 결과를 확인하지 못했습니다.');
};

export const removeProjectMember = async (projectId, memberId) => {
  const { data } = await apiClient.delete(
    `/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(memberId)}`,
  );
  if (data?.isSuccess === true) return data.data;
  throw new Error(data?.message || '프로젝트 멤버 방출 결과를 확인하지 못했습니다.');
};

export const updateProjectMemberRole = async (projectId, memberId, role) => {
  const { data } = await apiClient.patch(
    `/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(memberId)}/role`,
    null,
    { params: { role } },
  );
  if (data?.isSuccess === true) return data.data;
  throw new Error(data?.message || '프로젝트 멤버 역할 변경 결과를 확인하지 못했습니다.');
};

export const updateProjectStatus = async (projectId, status) => {
  const { data } = await apiClient.patch(`/projects/${encodeURIComponent(projectId)}/status`, null, {
    params: { status },
  });
  if (data?.isSuccess === true) return data.data;
  throw new Error(data?.message || '프로젝트 상태 변경 결과를 확인하지 못했습니다.');
};

export const updateProject = async (projectId, { title, category, content, startDate, endDate, thumbnail, totalSlots }) => {
  const { data } = await apiClient.put(`/projects/${encodeURIComponent(projectId)}`, {
    title, category, content, startDate, endDate, thumbnail, totalSlots,
  });
  if (data?.isSuccess === true) return data.data;
  throw new Error(data?.message || '프로젝트 정보 갱신 결과를 확인하지 못했습니다.');
};

export const getProjectSubgroups = async (projectId, signal) => {
  const { data } = await apiClient.get(`/projects/${encodeURIComponent(projectId)}/subgroups`, { signal });
  const payload = data?.data ?? data;

  if (Array.isArray(payload)) return payload;
  throw new Error('Unexpected subgroup response');
};

export const getProjectSubgroup = async (projectId, subgroupId, signal) => {
  const { data } = await apiClient.get(
    `/projects/${encodeURIComponent(projectId)}/subgroups/${encodeURIComponent(subgroupId)}`,
    { signal },
  );
  const subgroup = data?.data;

  if (subgroup?.subgroupId != null) return subgroup;
  throw new Error('Unexpected subgroup detail response');
};

export const deleteProjectSubgroup = async (projectId, subgroupId, signal) => {
  await apiClient.delete(
    `/projects/${encodeURIComponent(projectId)}/subgroups/${encodeURIComponent(subgroupId)}`,
    { signal },
  );
};

export const getProjectSubgroupMembers = async (projectId, subgroupId, signal) => {
  const { data } = await apiClient.get(
    `/projects/${encodeURIComponent(projectId)}/subgroups/${encodeURIComponent(subgroupId)}/members`,
    { signal },
  );

  if (data?.isSuccess && Array.isArray(data.data)) return data.data;
  throw new Error('Unexpected subgroup members response');
};

export const joinProjectSubgroup = async (projectId, subgroupId) => {
  const { data } = await apiClient.post(
    `/projects/${encodeURIComponent(projectId)}/subgroups/${encodeURIComponent(subgroupId)}/members/join`,
  );

  return data.data;
};

export const getAppliedProjects = () => {
  return apiClient.get('/projects/applications/me');
};

export const getBookmarkedProjects = (page = 0, size = 10) => {
  return apiClient.get('/recruitments/bookmark', {
    params: { page, size }
  });
};

export const getActiveProjects = () => {
  return apiClient.get('/projects/me');
};

export const getCompletedProjects = () => {
  return apiClient.get('/projects/activity/me');
};
