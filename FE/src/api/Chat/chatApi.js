import apiClient from '../apiClient';

export const getChatRooms = async ({ signal } = {}) => {
  const response = await apiClient.get('/chat-rooms', { signal });
  if (!response.data?.isSuccess || !Array.isArray(response.data?.data)) {
    throw new Error('채팅방 목록을 확인할 수 없습니다.');
  }
  return response.data.data;
};

export const getChatRoom = async (chatRoomId, { signal } = {}) => {
  const response = await apiClient.get(`/chat-rooms/${encodeURIComponent(chatRoomId)}`, { signal });
  const data = response.data?.data;

  if (!response.data?.isSuccess || !data || String(data.chatRoomId) !== String(chatRoomId)) {
    throw new Error('채팅방 정보를 확인할 수 없습니다.');
  }

  return data;
};
