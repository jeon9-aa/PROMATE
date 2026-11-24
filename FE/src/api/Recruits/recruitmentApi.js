import apiClient from "../apiClient";
import { getChatRooms } from "../Chat/chatApi";
import { openRecruitmentChat } from "./openRecruitmentChat";

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