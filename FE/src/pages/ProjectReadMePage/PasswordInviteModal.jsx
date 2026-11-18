import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';
import './PasswordInviteModal.css';

export default function PasswordInviteModal({ onClose, onSubmit }) {
  const dialogRef = useRef(null);
  const [password, setPassword] = useState('');

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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!/^[0-9]{4}$/.test(password)) return;
    onSubmit(password);
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      className="project-password-modal"
      aria-labelledby="project-password-title"
      aria-describedby="project-password-description"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right ||
            event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
    >
      <form className="project-password-form" onSubmit={handleSubmit}>
        <h2 id="project-password-title">비밀번호 공유</h2>
        <p id="project-password-description">
          이 비밀번호로 입장한 참가자는 지원자 검토 없이 바로 프로젝트에 참여합니다.
        </p>
        <div className="project-password-expiry">
          <Clock size={14} strokeWidth={2} aria-hidden="true" />
          <span>비밀번호 유효기간: 설정 후 24시간</span>
        </div>
        <div className="project-password-field">
          <label htmlFor="project-invite-password">비밀번호 설정</label>
          <input
            id="project-invite-password"
            type="password"
            inputMode="numeric"
            maxLength={4}
            minLength={4}
            pattern="[0-9]{4}"
            title="숫자 4자리를 입력해 주세요."
            autoComplete="new-password"
            placeholder="숫자 4자리를 입력해 주세요."
            value={password}
            onChange={(event) => setPassword(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            required
          />
        </div>
        <div className="project-password-actions">
          <button type="button" className="project-password-cancel" onClick={onClose}>취소</button>
          <button type="submit" className="project-password-submit">비밀번호 등록</button>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}
