import apiClient from "../apiClient.js";

export async function joinProjectByInvite(inviteToken, password) {
  const { data: response } = await apiClient.post(
    `/invites/${encodeURIComponent(inviteToken)}/join`,
    { password },
  );

  if (response?.isSuccess !== true || response.data?.projectId == null) {
    throw new Error("프로젝트 참여 결과를 확인할 수 없습니다.");
  }

  return response.data;
}
