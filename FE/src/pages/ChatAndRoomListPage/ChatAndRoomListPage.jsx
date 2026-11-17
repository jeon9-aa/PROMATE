import { useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ChatRoomList from './components/ChatRoomList';
import ChatPanel from './components/ChatPanel';
import { initialRooms } from './chatData';
import './ChatAndRoomListPage.css';

export default function ChatAndRoomListPage() {
  const { state } = useLocation();
  const [rooms, setRooms] = useState(() => state?.createdRoom
    ? [state.createdRoom, ...initialRooms.filter((item) => item.id !== state.createdRoom.id)]
    : initialRooms);
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = roomId || searchParams.get('roomId');
  const [drafts, setDrafts] = useState({});
  const room = rooms.find((item) => item.id === selectedId);

  function selectRoom(id) {
    if (window.matchMedia('(max-width: 640px)').matches) {
      navigate(`/chat/${encodeURIComponent(id)}`);
    } else {
      setSearchParams({ roomId: id });
    }
    setRooms((previous) => previous.map((item) => item.id === id ? { ...item, unread: 0 } : item));
  }

  function sendMessage() {
    const text = (drafts[selectedId] || '').trim();
    if (!text || !room) return;
    const message = { id: crypto.randomUUID(), text, sentAt: new Date().toISOString(), isMine: true };
    setRooms((previous) => previous.map((item) => item.id === selectedId
      ? { ...item, messages: [...item.messages, message] } : item));
    setDrafts((previous) => ({ ...previous, [selectedId]: '' }));
  }

  function leaveRoom() {
    if (!window.confirm('이 채팅방을 나가시겠어요?')) return;
    setRooms((previous) => previous.filter((item) => item.id !== selectedId));
    navigate('/chat');
  }

  return (
    <section className="chat-page" aria-labelledby="chat-page-title">
      <h1 id="chat-page-title">채팅</h1>
      <div className={`chat-page__workspace${roomId ? ' chat-page__workspace--selected chat-page__workspace--panel-only' : ''}`}>
        {!roomId && <ChatRoomList rooms={rooms} selectedId={selectedId} onSelect={selectRoom} />}
        <ChatPanel key={room?.id || 'empty'} room={room} draft={drafts[selectedId] || ''}
          onDraftChange={(value) => setDrafts((previous) => ({ ...previous, [selectedId]: value }))}
          onSend={sendMessage}
          onBack={() => navigate(roomId ? `/chat?${new URLSearchParams({ roomId })}` : '/chat')}
          onLeave={leaveRoom} />
      </div>
    </section>
  );
}
