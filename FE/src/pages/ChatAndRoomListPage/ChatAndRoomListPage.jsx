import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ChatRoomList from './components/ChatRoomList';
import ChatPanel from './components/ChatPanel';
import { initialRooms } from './chatData';
import { getChatRoom } from '../../api/Chat/chatApi';
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
  const [retryCount, setRetryCount] = useState(0);
  const [roomRequest, setRoomRequest] = useState(null);
  const isDemoRoom = initialRooms.some((item) => item.id === selectedId);
  const shouldFetch = Boolean(selectedId) && !isDemoRoom;
  const requestKey = `${selectedId}:${retryCount}`;
  const isLoading = shouldFetch && roomRequest?.key !== requestKey;
  const error = shouldFetch && roomRequest?.key === requestKey ? roomRequest.error : null;
  const room = rooms.find((item) => item.id === selectedId);

  useEffect(() => {
    if (!shouldFetch) return;
    const controller = new AbortController();

    getChatRoom(selectedId, { signal: controller.signal }).then((data) => {
      if (controller.signal.aborted) return;
      setRooms((previous) => {
        const existing = previous.find((item) => item.id === String(data.chatRoomId));
        const updated = {
          ...existing,
          id: String(data.chatRoomId),
          recruitId: data.recruitId,
          projectName: data.recruitTitle,
          chatPartnerId: data.chatPartnerId,
          name: existing?.name || '채팅 상대',
          avatarUrl: data.chatPartnerProfileImageUrl,
          lastMessage: data.lastMessage,
          lastMessageAt: data.lastMessageAt,
          unread: data.unreadCount ?? 0,
          messages: existing?.messages || [],
        };
        return existing
          ? previous.map((item) => item.id === updated.id ? updated : item)
          : [updated, ...previous];
      });
      setRoomRequest({ key: requestKey, error: null });
    }).catch((error) => {
      if (!controller.signal.aborted) {
        setRoomRequest({ key: requestKey, error: error.message || '채팅방 정보를 불러오지 못했습니다.' });
      }
    });

    return () => controller.abort();
  }, [selectedId, shouldFetch, requestKey]);

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
        {isLoading || error ? (
          <div className="chat-panel chat-panel--empty" aria-busy={isLoading}>
            {error ? <><p role="alert">{error}</p><button type="button" onClick={() => setRetryCount((count) => count + 1)}>다시 시도</button></>
              : <p role="status">채팅방 정보를 불러오는 중입니다...</p>}
            <button type="button" onClick={() => navigate('/chat')}>채팅방 목록으로</button>
          </div>
        ) : <ChatPanel key={room?.id || 'empty'} room={room} draft={drafts[selectedId] || ''}
          onDraftChange={(value) => setDrafts((previous) => ({ ...previous, [selectedId]: value }))}
          onSend={sendMessage}
          onBack={() => navigate(roomId ? `/chat?${new URLSearchParams({ roomId })}` : '/chat')}
          onLeave={leaveRoom} />}
      </div>
    </section>
  );
}
