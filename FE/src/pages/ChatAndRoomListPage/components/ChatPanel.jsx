import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, LogOut, Menu, MessageCircle, Send } from 'lucide-react';
import ProfileAvatar from '../../../components/ProfileAvatar/ProfileAvatar';
import ChatMessage from './ChatMessage';

export default function ChatPanel({ room, draft, onDraftChange, onSend, onBack, onLeave, canSend = true, status = '', historyLoading = false, historyError = '', isLeaving = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    const element = messagesRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [room?.id, room?.messages.length]);

  useEffect(() => {
    if (!menuOpen) return;
    function close(event) {
      if (event.type === 'keydown') {
        if (event.key !== 'Escape') return;
        menuButtonRef.current?.focus();
      } else if (menuRef.current?.contains(event.target)) return;
      setMenuOpen(false);
    }
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [menuOpen]);

  if (!room) return <div className="chat-panel chat-panel--empty"><MessageCircle size={36} /><p>채팅방을 선택해 대화를 시작하세요.</p></div>;

  return (
    <section className="chat-panel" aria-label={`${room.name}님과의 채팅`}>
      <header className="chat-panel__header">
        <button type="button" className="chat-icon-button" aria-label="채팅방 목록으로" onClick={onBack}><ChevronLeft size={20} /></button>
        <ProfileAvatar src={room.avatarUrl} alt={`${room.name} 프로필`} size={40} />
        <div className="chat-panel__identity">
          <h2>
            {room.recruitId != null ? (
              <Link className="chat-panel__project-link" to={`/readme/${encodeURIComponent(room.recruitId)}`} title="프로젝트 소개 페이지로 이동">
                {room.projectName}
              </Link>
            ) : room.projectName}
            {' · '}{room.name}
          </h2>
          {room.memberCount != null && <span>멤버 {room.memberCount}명</span>}
        </div>
        {onLeave && <div className="chat-panel__menu" ref={menuRef}>
          <button ref={menuButtonRef} type="button" className="chat-icon-button" aria-label="채팅방 메뉴" aria-expanded={menuOpen} aria-controls="chat-room-actions" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></button>
          {menuOpen && <div id="chat-room-actions" className="chat-panel__dropdown"><button type="button" disabled={isLeaving} onClick={() => { setMenuOpen(false); onLeave(); }}><LogOut size={16} />채팅방 나가기</button></div>}
        </div>}
      </header>
      {isLeaving && <p className="chat-empty" role="status">???? ??? ????...</p>}
      <div className="chat-panel__messages" ref={messagesRef} role="log" aria-label="대화 내용" aria-live="polite">
        {historyLoading && <p className="chat-empty" role="status">이전 메시지를 불러오는 중입니다.</p>}
        {historyError && <p className="chat-empty" role="alert">{historyError} 페이지를 새로고침해 다시 시도해 주세요.</p>}
        {room.messages.map((message) => <ChatMessage key={message.id} message={message} room={room} />)}
        {!historyLoading && !historyError && !room.messages.length && <p className="chat-empty">첫 메시지를 보내보세요.</p>}
      </div>
      {status && <p className="chat-connection-status" role="status">{status}</p>}
      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSend && !isLeaving) onSend();
        }}
      >
        <textarea
          disabled={isLeaving}
          rows={1}
          aria-label="메시지"
          placeholder="메시지를 입력하세요"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
              event.preventDefault();
              if (canSend && !isLeaving) onSend();
            }
          }}
        />
        <button className="chat-composer__send" type="submit" aria-label="메시지 보내기" disabled={isLeaving || !canSend || !draft.trim()}>
          <Send size={18} />
        </button>
      </form>
    </section>
  );
}
