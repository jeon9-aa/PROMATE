import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './PasswordInviteModal.css';

export default function PasswordJoinNoticeModal({ onClose, onContinue }) {
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
        <h2 id="project-password-join-title">비밀번호로 참여하기</h2>
        <p id="project-password-join-description">
          팀장이 설정한 초대 비밀번호를 입력하면 지원자 검토 없이 바로 프로젝트에 참여할 수 있습니다.
          <br />
          비밀번호를 전달받았다면 입력을 진행해 주세요.
        </p>
        <div className="project-password-actions">
          <button type="button" className="project-password-cancel" onClick={onClose}>취소</button>
          <button type="button" className="project-password-submit" onClick={onContinue}>비밀번호 입력하기</button>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
