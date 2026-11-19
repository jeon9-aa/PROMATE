import apiClient from "../apiClient.js";
import axios from "axios";

// 공개 조회에는 인증 및 토큰 재발급 인터셉터를 적용 x
const publicInviteClient = axios.create({
  baseURL: apiClient.defaults.baseURL,
  timeout: apiClient.defaults.timeout,
});

export async function getProjectInvite(inviteToken, { signal } = {}) {
  const { data: response } = await publicInviteClient.get(
    `/invites/${encodeURIComponent(inviteToken)}`,
    { signal },
  );

  if (response?.isSuccess !== true) {
    throw new Error(response?.message || "초대 정보를 조회할 수 없습니다.");
  }
  if (response.data?.projectId == null || !response.data?.projectTitle ||
      !response.data?.expiresAt || Number.isNaN(Date.parse(response.data.expiresAt))) {
    throw new Error("프로젝트 초대 정보를 확인할 수 없습니다.");
  }
  return response.data;
}

export async function createProjectInvite(projectId, password) {
  const { data: response } = await apiClient.post(
    `/projects/${encodeURIComponent(projectId)}/invites`,
    { password },
  );

  if (response?.isSuccess !== true || !response.data?.token ||
      !response.data?.inviteUrl || !response.data?.expiresAt ||
      Number.isNaN(Date.parse(response.data.expiresAt))) {
    throw new Error("프로젝트 초대 링크 생성 결과를 확인할 수 없습니다.");
  }

  return response.data;
}

export async function joinProjectByInvite(inviteToken, password) {
  const { data: response } = await apiClient.post(
    `/invites/${encodeURIComponent(inviteToken)}/join`,
    { password },
  );

  if (response?.isSuccess !== true) {
    throw new Error(response?.message || "프로젝트 초대 참여에 실패했습니다.");
  }
  if (!Number.isInteger(response.data?.projectId) || response.data.projectId <= 0) {
    throw new Error("프로젝트 참여 결과를 확인할 수 없습니다.");
  }

  return response.data;
}
