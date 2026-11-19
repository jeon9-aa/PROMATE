import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ChatRoomList from './components/ChatRoomList';
import ChatPanel from './components/ChatPanel';
import { getChatRoom, getChatRooms, leaveChatRoom } from '../../api/Chat/chatApi';
import useChatSocket from './useChatSocket';
import { mergeChatMessages } from './chatMessages';
import './ChatAndRoomListPage.css';

function toRoom(data, existing) {
  return {
    ...existing,
    id: String(data.chatRoomId),
    recruitId: data.recruitId,
    projectName: data.recruitTitle,
    chatPartnerId: data.chatPartnerId,
    name: data.chatPartnerName || existing?.name || '채팅 상대',
    avatarUrl: data.chatPartnerProfileImageUrl,
    lastMessage: data.lastMessage,
    lastMessageAt: data.lastMessageAt,
    unread: data.unreadCount ?? 0,
    messages: existing?.messages || [],
  };
}

export default function ChatAndRoomListPage() {
  const { state } = useLocation();
  const [rooms, setRooms] = useState(() => state?.createdRoom
    ? [state.createdRoom]
    : []);
  const [listRetryCount, setListRetryCount] = useState(0);
  const [listRequest, setListRequest] = useState(null);
  const isListLoading = listRequest?.key !== listRetryCount;
  const listError = !isListLoading ? listRequest?.error : null;
  const listedRooms = (listRequest?.ids || []).map((id) => rooms.find((item) => item.id === id)).filter(Boolean);
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = roomId || searchParams.get('roomId');
  const [drafts, setDrafts] = useState({});
  const [leavingRoomId, setLeavingRoomId] = useState(null);
  const leavePending = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const [roomRequest, setRoomRequest] = useState(null);
  const shouldFetch = Boolean(selectedId);
  const requestKey = `${selectedId}:${retryCount}`;
  const isLoading = shouldFetch && roomRequest?.key !== requestKey;
  const error = shouldFetch && roomRequest?.key === requestKey ? roomRequest.error : null;
  const room = rooms.find((item) => item.id === selectedId);
  const liveRoomId = room && !isLoading && !error && /^[1-9]\d*$/.test(selectedId || '')
    ? selectedId : null;
  const socket = useChatSocket(liveRoomId, (id, incoming) => {
    setRooms((previous) => previous.map((item) => {
      if (item.id !== id) return item;
      const messages = mergeChatMessages(item.messages, incoming);
      const latest = messages.at(-1);
      return {
        ...item, messages,
        lastMessage: latest?.text ?? item.lastMessage,
        lastMessageAt: latest?.sentAt ?? item.lastMessageAt,
      };
    }));
  }, (id) => {
    setRooms((previous) => previous.map((item) => item.id === id ? { ...item, unread: 0 } : item));
  });

  useEffect(() => {
    const controller = new AbortController();
    getChatRooms({ signal: controller.signal }).then((data) => {
      if (controller.signal.aborted) return;
      setRooms((previous) => {
        const updated = data.map((item) => toRoom(item, previous.find((room) => room.id === String(item.chatRoomId))));
        const ids = new Set(updated.map((item) => item.id));
        return [...updated, ...previous.filter((item) => !ids.has(item.id))];
      });
      setListRequest({ key: listRetryCount, ids: data.map((item) => String(item.chatRoomId)), error: null });
    }).catch((error) => {
      if (!controller.signal.aborted) {
        setListRequest({ key: listRetryCount, ids: [], error: error.message || '채팅방 목록을 불러오지 못했습니다.' });
      }
    });
    return () => controller.abort();
  }, [listRetryCount]);

  useEffect(() => {
    if (!shouldFetch) return;
    const controller = new AbortController();

    getChatRoom(selectedId, { signal: controller.signal }).then((data) => {
      if (controller.signal.aborted) return;
      setRooms((previous) => {
        const existing = previous.find((item) => item.id === String(data.chatRoomId));
        const updated = toRoom(data, existing);
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
  }

  function sendMessage() {
    const text = (drafts[selectedId] || '').trim();
    if (!text || !room || leavingRoomId === selectedId || !socket.send(text)) return;
    setDrafts((previous) => ({ ...previous, [selectedId]: '' }));
  }

  async function leaveRoom() {
    if (!selectedId || !room || leavePending.current) return;
    if (!window.confirm('이 채팅방을 나가시겠어요?')) return;
    const leavingId = selectedId;
    leavePending.current = true;
    setLeavingRoomId(leavingId);
    try {
      await leaveChatRoom(leavingId);
      setRooms((previous) => previous.filter((item) => item.id !== leavingId));
      setListRequest((previous) => previous
        ? { ...previous, ids: previous.ids.filter((id) => id !== leavingId) }
        : previous);
      setDrafts((previous) => {
        const next = { ...previous };
        delete next[leavingId];
        return next;
      });
      setListRetryCount((count) => count + 1);
      navigate('/chat', { replace: true });
    } catch (error) {
      alert(error.message || '채팅방 나가기에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      leavePending.current = false;
      setLeavingRoomId(null);
    }
  }

  return (
    <section className="chat-page" aria-labelledby="chat-page-title">
      <h1 id="chat-page-title">채팅</h1>
      <div className={`chat-page__workspace${roomId ? ' chat-page__workspace--selected chat-page__workspace--panel-only' : ''}`}>
        {!roomId && <ChatRoomList rooms={listedRooms} selectedId={selectedId} onSelect={selectRoom}
          isLoading={isListLoading} error={listError} onRetry={() => setListRetryCount((count) => count + 1)} />}
        {isLoading || error ? (
          <div className="chat-panel chat-panel--empty" aria-busy={isLoading}>
            {error ? <><p role="alert">{error}</p><button type="button" onClick={() => setRetryCount((count) => count + 1)}>다시 시도</button></>
              : <p role="status">채팅방 정보를 불러오는 중입니다...</p>}
            <button type="button" onClick={() => navigate('/chat')}>채팅방 목록으로</button>
          </div>
        ) : <ChatPanel key={room?.id || 'empty'} room={room} draft={drafts[selectedId] || ''}
          onDraftChange={(value) => setDrafts((previous) => ({ ...previous, [selectedId]: value }))}
          onSend={sendMessage}
          canSend={socket.ready && leavingRoomId !== selectedId}
          historyLoading={socket.historyLoading}
          historyError={socket.historyError}
          status={socket.error || socket.readError || (socket.ready ? '' : '?? ??? ?? ????.')}
          onBack={() => navigate(roomId ? `/chat?${new URLSearchParams({ roomId })}` : '/chat')}
          onLeave={leaveRoom} isLeaving={leavingRoomId === selectedId} />}
      </div>
    </section>
  );
}
