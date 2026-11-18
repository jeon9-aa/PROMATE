export async function openRecruitmentChat(recruitmentId, { getRooms, createRoom }) {
  const findRoom = (rooms) => rooms.find((room) =>
    String(room.recruitId) === String(recruitmentId) &&
    Number.isInteger(room.chatRoomId) && room.chatRoomId > 0);

  const existing = findRoom(await getRooms());
  if (existing) return existing;

  try {
    return await createRoom(recruitmentId);
  } catch (error) {
    if ([400, 409].includes(error.response?.status)) {
      const room = await getRooms().then(findRoom).catch(() => undefined);
      if (room) return room;
    }
    throw error;
  }
}
