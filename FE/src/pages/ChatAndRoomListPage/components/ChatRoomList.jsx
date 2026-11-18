import ProfileAvatar from '../../../components/ProfileAvatar/ProfileAvatar';
import { formatRoomTime } from '../chatData';

export default function ChatRoomList({ rooms, selectedId, onSelect }) {
  return (
    <aside className="chat-room-list" aria-label="채팅방 목록">
      <div className="chat-room-list__heading">전체 채팅방 {rooms.length}</div>
      <ul className="chat-room-list__items">
        {rooms.map((room) => {
          const latest = room.messages.at(-1);
          const preview = latest?.text ?? room.lastMessage;
          const previewAt = latest?.sentAt ?? room.lastMessageAt;
          return (
            <li key={room.id}>
              <button type="button" className={`chat-room-item${room.id === selectedId ? ' chat-room-item--active' : ''}`}
                aria-pressed={room.id === selectedId} onClick={() => onSelect(room.id)}>
                <ProfileAvatar src={room.avatarUrl} alt={`${room.name} 프로필`} size={40} />
                <span className="chat-room-item__content">
                  <strong>{room.projectName} · {room.name}</strong>
                  <span>{preview || '아직 메시지가 없습니다.'}</span>
                </span>
                <span className="chat-room-item__meta">
                  {previewAt && <time dateTime={previewAt}>{formatRoomTime(previewAt)}</time>}
                  {room.unread > 0 && <span className="chat-room-item__badge" aria-label={`읽지 않은 메시지 ${room.unread}개`}>{room.unread}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {!rooms.length && <p className="chat-empty">참여 중인 채팅방이 없습니다.</p>}
    </aside>
  );
}
