import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './PasswordInviteModal.css';

export default function PasswordJoinNoticeModal({ onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialogRef}
      className="project-password-modal"
      aria-labelledby="project-password-join-title"
      aria-describedby="project-password-join-description"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right ||
            event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
    >
      <div className="project-password-form">
        <h2 id="project-password-join-title">초대 링크로 참여하기</h2>
        <div id="project-password-join-description" className="project-password-join-description">
          <p>팀장에게 초대 링크와 비밀번호를 받은 후, 그 링크에 접속해 비밀번호를 입력하면 <span className="project-password-join-highlight">지원자 검토 없이</span> 바로 프로젝트에 참여할 수 있습니다.</p>
        </div>
        <div className="project-password-actions">
          <button type="button" className="project-password-submit" onClick={onClose}>닫기</button>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
