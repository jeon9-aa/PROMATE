export function toChatMessage(data, roomId, userId) {
  if (!data || String(data.chatRoomId) !== String(roomId) || data.messageId == null ||
      typeof data.content !== 'string' || !Number.isFinite(Date.parse(data.createdAt))) return null;
  return {
    id: String(data.messageId), text: data.content, sentAt: data.createdAt,
    senderName: data.senderName, senderProfileImageUrl: data.senderProfileImageUrl,
    isMine: userId != null && String(data.senderId) === String(userId),
  };
}

export function mergeChatMessages(existing, incoming) {
  const messages = new Map(existing.map((message) => [message.id, message]));
  for (const message of incoming) messages.set(message.id, message);
  return [...messages.values()].sort((a, b) => Date.parse(a.sentAt) - Date.parse(b.sentAt));
}
