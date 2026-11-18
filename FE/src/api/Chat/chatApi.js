import apiClient from '../apiClient';

export async function getChatMessages(chatRoomId, signal) {
  const response = await apiClient.get(`/chat-rooms/${encodeURIComponent(chatRoomId)}/messages`, { signal });
  if (!Array.isArray(response.data.data)) {
    throw new Error('메시지 내역 응답 형식이 올바르지 않습니다.');
  }
  return response.data.data;
}
