import apiClient from "../apiClient";
import { getChatRooms } from "../Chat/chatApi";
import { openRecruitmentChat } from "./openRecruitmentChat";
import { getAppliedProjects } from "../Project/projectApi";

export const getOrCreateChatRoom = (recruitmentId) => openRecruitmentChat(recruitmentId, {
  getRooms: getChatRooms,
  createRoom: createChatRoom,
});

export const createChatRoom = async (recruitmentId) => {
  const response = await apiClient.post(`/recruitments/${recruitmentId}/chat-rooms`);
  const chatRoomId = response.data?.data?.chatRoomId;

  if (!response.data?.isSuccess || !Number.isInteger(chatRoomId) || chatRoomId <= 0) {
    throw new Error(response.data?.message && !response.data?.isSuccess
      ? response.data.message
      : "생성된 채팅방 정보를 확인할 수 없습니다.");
  }

  return response.data.data;
};

export const getApplicationForm = async (recruitmentId) => {
  const response = await apiClient.get(`/recruitments/${recruitmentId}/application-form`);

  return response.data;
};

export const postApplication = async (recruitmentId, applicationData) => {
  const response = await apiClient.post(`/recruitments/${recruitmentId}/apply`, applicationData);

  return response.data;
};
// The server checks application ownership using the access token.
export const resolveMyApplicationId = async (recruitmentId, applicationId) => {
  if (applicationId != null) return applicationId;

  const { data } = await getAppliedProjects();
  if (!data?.isSuccess || !Array.isArray(data.data)) {
    throw new Error(data?.message || "내 지원 목록을 불러오지 못했습니다.");
  }
  const application = data.data.find((item) => String(item.recruitmentId) === String(recruitmentId));
  if (application?.applicationId == null) {
    throw new Error("이 모집글에 제출한 지원서를 내 지원 목록에서 찾을 수 없습니다.");
  }
  return application.applicationId;
};

export const getMyApplication = async (recruitmentId, applicationId) => {
  const response = await apiClient.get(`/recruitments/${recruitmentId}/applications/${applicationId}`);
  return response.data;
};

export const updateMyApplication = async (recruitmentId, applicationId, applicationData) => {
  const response = await apiClient.put(`/recruitments/${recruitmentId}/applications/${applicationId}`, applicationData);
  return response.data;
};

export const cancelMyApplication = async (recruitmentId, applicationId) => {
  const response = await apiClient.delete(`/recruitments/${recruitmentId}/applications/${applicationId}`);
  return response.data;
};
