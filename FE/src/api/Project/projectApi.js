import apiClient from '../apiClient';

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

export const joinProjectSubgroup = async (projectId, subgroupId) => {
  const { data } = await apiClient.post(
    `/projects/${encodeURIComponent(projectId)}/subgroups/${encodeURIComponent(subgroupId)}/members`,
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
