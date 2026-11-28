import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { getChatRooms } from '../../api/Chat/chatApi';

export default function ChatLink() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let controller;
    const refresh = async () => {
      if (document.visibilityState === 'hidden') return;
      controller?.abort();
      const request = new AbortController();
      controller = request;
      try {
        const rooms = await getChatRooms({ signal: request.signal });
        if (!request.signal.aborted) {
          setUnreadCount(rooms.reduce((total, room) => {
            const count = Number(room.unreadCount);
            return total + (Number.isSafeInteger(count) && count > 0 ? count : 0);
          }, 0));
        }
      } catch {
        // Keep the last known count until the next successful refresh.
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, 10000);
    window.addEventListener('chatUnreadUpdated', refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller?.abort();
      window.clearInterval(interval);
      window.removeEventListener('chatUnreadUpdated', refresh);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  return (
    <Link
      to="/chat"
      className="header-chat-btn"
      aria-label={unreadCount > 0 ? `내 채팅 목록, 읽지 않은 메시지 ${unreadCount}개` : '내 채팅 목록'}
      data-tooltip="채팅 목록"
    >
      <MessageCircle size={20} aria-hidden="true" />
      {unreadCount > 0 && (
        <span className="header-chat-badge" aria-hidden="true">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
