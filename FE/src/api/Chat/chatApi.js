import apiClient from '../apiClient';

export async function markChatMessagesRead(chatRoomId, signal) {
  await apiClient.patch(`/chat-rooms/${encodeURIComponent(chatRoomId)}/messages/read`, undefined, { signal });
  window.dispatchEvent(new Event('chatUnreadUpdated'));
}

export async function getChatMessages(chatRoomId, signal) {
  const response = await apiClient.get(`/chat-rooms/${encodeURIComponent(chatRoomId)}/messages`, { signal });
  if (!Array.isArray(response.data.data)) {
    throw new Error('메시지 내역 응답 형식이 올바르지 않습니다.');
  }
  return response.data.data;
}


export const leaveChatRoom = async (chatRoomId) => {
  const response = await apiClient.delete(`/chat-rooms/${encodeURIComponent(chatRoomId)}/leave`);
  const data = response.data?.data;
  if (!response.data?.isSuccess || String(data?.chatRoomId) !== String(chatRoomId)) {
    throw new Error('채팅방 나가기 결과를 확인할 수 없습니다.');
  }
  window.dispatchEvent(new Event('chatUnreadUpdated'));
  return data;
};

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
