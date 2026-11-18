import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { getUserInfo } from '../../api/User/userProfileApi';
import { useAuthStore } from '../../stores/useAuthStore';
import { getChatMessages, markChatMessagesRead } from '../../api/Chat/chatApi';
import { toChatMessage } from './chatMessages';
import { createChatReadMarker } from './chatReadMarker';

export default function useChatSocket(roomId, onMessage) {
  const clientRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const [connection, setConnection] = useState({});
  const [history, setHistory] = useState({});
  const [readStatus, setReadStatus] = useState({});
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  useEffect(() => {
    if (!roomId || !isLoggedIn) return;
    let disposed = false;
    let userId;
    let historyController;
    const readMarker = createChatReadMarker({
      markRead: (signal) => markChatMessagesRead(roomId, signal),
      isVisible: () => document.visibilityState === 'visible',
      onSuccess: () => setReadStatus({ roomId, error: '' }),
      onError: () => setReadStatus({ roomId, error: '읽음 처리에 실패했습니다. 채팅방을 다시 열어 주세요.' }),
    });
    const handleVisibility = () => { void readMarker.flush(); };
    document.addEventListener('visibilitychange', handleVisibility);
    async function loadHistory() {
      historyController?.abort();
      const controller = new AbortController();
      historyController = controller;
      setHistory({ roomId, loading: true, error: '' });
      try {
        const data = await getChatMessages(roomId, controller.signal);
        if (disposed || controller.signal.aborted) return;
        const messages = data.map((item) => toChatMessage(item, roomId, userId)).filter(Boolean);
        onMessageRef.current(roomId, messages);
        setHistory({ roomId, loading: false, error: '' });
        void readMarker.request();
      } catch (error) {
        if (disposed || controller.signal.aborted) return;
        setHistory({ roomId, loading: false, error: error.message || '이전 메시지를 불러오지 못했습니다.' });
      }
    }
    const update = (ready, error = '') => {
      if (!disposed) setConnection({ roomId, ready, error });
    };
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    const client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
      reconnectDelay: 5000,
      connectionTimeout: 10000,
      beforeConnect: () => {
        update(false);
        const token = localStorage.getItem('accessToken');
        if (!token || token === 'null' || token === 'undefined') {
          update(false, '로그인이 필요합니다.');
          void client.deactivate();
          return;
        }
        client.connectHeaders = { Authorization: `Bearer ${token}` };
      },
      onConnect: () => {
        if (disposed) return;
        client.subscribe(`/topic/chat/${roomId}`, (frame) => {
          if (disposed) return;
          try {
            const response = JSON.parse(frame.body);
            if (!response.isSuccess) {
              update(true, response.message || '메시지 전송에 실패했습니다.');
              return;
            }
            const message = toChatMessage(response.data, roomId, userId);
            if (!message) return;
            onMessageRef.current(roomId, [message]);
            void readMarker.request();
            update(true);
          } catch {
            update(true, '메시지를 읽지 못했습니다.');
          }
        });
        update(true);
        // 재연결 중 놓친 메시지도 구독 후 내역을 조회해 보충한다.
        void loadHistory();
      },
      onStompError: (frame) => update(false, frame.headers.message || '채팅 서버에서 오류가 발생했습니다.'),
      onWebSocketClose: () => update(false, '연결이 끊어졌습니다. 다시 연결 중입니다.'),
      onWebSocketError: () => update(false, '채팅 서버에 연결할 수 없습니다.'),
    });
    clientRef.current = client;
    getUserInfo().then((response) => {
      userId = response.data?.userId ?? response.data?.id;
      if (!disposed) {
        void loadHistory();
        client.activate();
      }
    }).catch(() => {
      update(false, '사용자 정보를 확인하지 못했습니다. 페이지를 새로고침해 주세요.');
      if (!disposed) setHistory({ roomId, loading: false, error: '이전 메시지를 불러오지 못했습니다.' });
    });
    return () => {
      disposed = true;
      historyController?.abort();
      readMarker.dispose();
      document.removeEventListener('visibilitychange', handleVisibility);
      clientRef.current = null;
      void client.deactivate();
    };
  }, [roomId, isLoggedIn]);

  const ready = isLoggedIn && connection.roomId === roomId && connection.ready;
  function send(content) {
    const client = clientRef.current;
    if (!ready || !client?.connected || !content.trim()) return false;
    try {
      client.publish({
        destination: `/app/chat/${roomId}/messages`,
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}`, 'content-type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });
      return true;
    } catch {
      setConnection({ roomId, ready: false, error: '메시지를 전송하지 못했습니다. 연결 상태를 확인해 주세요.' });
      return false;
    }
  }
  return {
    send, ready,
    historyLoading: Boolean(roomId && isLoggedIn && (history.roomId !== roomId || history.loading)),
    historyError: history.roomId === roomId ? history.error : '',
    readError: readStatus.roomId === roomId ? readStatus.error : '',
    error: !isLoggedIn ? '로그인이 필요합니다.' : connection.roomId === roomId ? connection.error : '',
  };
}
