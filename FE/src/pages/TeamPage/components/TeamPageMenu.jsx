import GuardedButton from '../../../components/GuardedButton/GuardedButton.jsx';
import { useEffect, useRef, useState } from 'react';
import { Ellipsis } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TeamPageMenu({ projectId, projectTitle, dueDate, onCalendarClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const goTo = (path) => {
    setIsOpen(false);
    navigate(path, { state: { projectTitle, dueDate } });
  };

  return (
    <div className="team-page-menu" ref={containerRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}>
      <GuardedButton type="button" className="team-page-menu__trigger" ref={buttonRef}
        aria-label="프로젝트 메뉴" aria-expanded={isOpen} aria-controls="team-page-navigation"
        onClick={() => setIsOpen((open) => !open)}>
        <Ellipsis size={24} aria-hidden="true" />
      </GuardedButton>
      {isOpen && (
        <nav id="team-page-navigation" className="team-page-menu__popover" aria-label="프로젝트 페이지">
          <GuardedButton type="button" className="team-page-menu__current" aria-current="page" onClick={() => setIsOpen(false)}>대시 보드</GuardedButton>
          <GuardedButton type="button" onClick={() => goTo(`/task-board?projectId=${projectId}`)}>태스크 보드</GuardedButton>
          <GuardedButton type="button" onClick={() => { setIsOpen(false); onCalendarClick(); }}>캘린더</GuardedButton>
          <GuardedButton type="button" onClick={() => goTo(`/board?projectId=${projectId}`)}>게시판</GuardedButton>
          <GuardedButton type="button" onClick={() => goTo(`/project/${projectId}/smallMeetingList`)}>소모임</GuardedButton>
          <GuardedButton type="button" disabled title="설정 기능은 준비 중입니다">설정</GuardedButton>
        </nav>
      )}
    </div>
  );
}
