import GuardedButton from '../GuardedButton/GuardedButton.jsx';
import { useEffect, useId, useRef, useState } from 'react';
import { Ellipsis } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TeamPageMenu.css';

export default function TeamPageMenu({ projectId, projectTitle, dueDate, currentPage = 'dashboard', onCalendarClick, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const navigationId = useId();

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
        aria-label="프로젝트 메뉴" aria-expanded={isOpen} aria-controls={navigationId} disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}>
        <Ellipsis size={24} aria-hidden="true" />
      </GuardedButton>
      {isOpen && (
        <nav id={navigationId} className="team-page-menu__popover" aria-label="프로젝트 페이지">
          {[
            { key: 'dashboard', label: '팀 페이지', path: `/project/${projectId}` },
            { key: 'tasks', label: '태스크 보드', path: `/task-board?projectId=${projectId}` },
            { key: 'calendar', label: '캘린더', path: `/project/${projectId}#calendar` },
            { key: 'board', label: '게시판', path: `/board?projectId=${projectId}` },
            { key: 'meetings', label: '소모임', path: `/project/${projectId}/smallMeetingList` },
          ].map(({ key, label, path }) => (
            <GuardedButton key={key} type="button"
              className={currentPage === key ? 'team-page-menu__current' : undefined}
              aria-current={currentPage === key ? 'page' : undefined}
              onClick={() => {
                setIsOpen(false);
                if (key === 'calendar' && onCalendarClick) onCalendarClick();
                else goTo(path);
              }}>
              {label}
            </GuardedButton>
          ))}
          <GuardedButton type="button" disabled title="설정 기능은 준비 중입니다">설정</GuardedButton>
        </nav>
      )}
    </div>
  );
}
