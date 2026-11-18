import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ChatRoomList from './components/ChatRoomList';
import ChatPanel from './components/ChatPanel';
import { initialRooms } from './chatData';
import useChatSocket from './useChatSocket';
import { mergeChatMessages } from './chatMessages';
import './ChatAndRoomListPage.css';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';

export default function ChatAndRoomListPage() {
  const [rooms, setRooms] = useState(isMock ? initialRooms : []);
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = roomId || searchParams.get('roomId');
  const [drafts, setDrafts] = useState({});
  const liveRoomId = !isMock && /^[1-9]\d*$/.test(selectedId || '') ? selectedId : null;
  const room = rooms.find((item) => item.id === selectedId) || (liveRoomId ? {
    id: liveRoomId, projectName: '채팅방', name: liveRoomId, messages: [], unread: 0,
  } : undefined);
  const socket = useChatSocket(liveRoomId, (id, incoming) => {
    setRooms((previous) => {
      const existing = previous.find((item) => item.id === id);
      const messages = mergeChatMessages(existing?.messages || [], incoming);
      if (!existing) return [...previous, { id, projectName: '채팅방', name: id, unread: 0, messages }];
      return previous.map((item) => item.id === id ? { ...item, messages } : item);
    });
  });

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
    if (isMock) {
      const message = { id: crypto.randomUUID(), text, sentAt: new Date().toISOString(), isMine: true };
      setRooms((previous) => previous.map((item) => item.id === selectedId
        ? { ...item, messages: [...item.messages, message] } : item));
    } else if (!socket.send(text)) return;
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
          canSend={isMock || socket.ready}
          historyLoading={!isMock && socket.historyLoading}
          historyError={isMock ? '' : socket.historyError}
          status={isMock ? '' : socket.error || socket.readError || (socket.ready ? '' : '채팅 서버에 연결 중입니다.')}
          onBack={() => navigate(roomId ? `/chat?${new URLSearchParams({ roomId })}` : '/chat')}
          onLeave={isMock ? leaveRoom : undefined} />
      </div>
    </section>
  );
}
