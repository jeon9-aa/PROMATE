import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatInviteExpiry } from './formatInviteExpiry';
import './ShareLinkModal.css';

export default function ShareLinkModal({
  shareUrl,
  onClose,
  title = '링크 공유',
  description = '해당 링크로 입장한 참가자는 지원자 검토 후 참여할 수 있습니다.',
  linkLabel = '공유 링크',
  expiresAt,
}) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [copyMessage, setCopyMessage] = useState('');

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyMessage('링크가 복사되었습니다.');
    } catch {
      inputRef.current?.focus();
      inputRef.current?.select();
      setCopyMessage('링크를 선택했습니다. 직접 복사해 주세요.');
    }
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      className="project-share-modal"
      aria-labelledby="project-share-title"
      aria-describedby="project-share-description"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right ||
            event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
    >
      <h2 id="project-share-title">{title}</h2>
      <p id="project-share-description">
        {description}
      </p>
      <div className="project-share-field">
        <label htmlFor="project-share-url">{linkLabel}</label>
        <div className="project-share-input-row">
          <input ref={inputRef} id="project-share-url" value={shareUrl} readOnly />
          <button type="button" onClick={handleCopy}>복사</button>
        </div>
      </div>
      {expiresAt && (
        <p className="project-share-expiry">
          유효시간: <time dateTime={new Date(expiresAt).toISOString()}>{formatInviteExpiry(expiresAt)}</time>까지 (한국 시간)
        </p>
      )}
      <p className="project-share-status" role="status">{copyMessage}</p>
    </dialog>,
    document.body,
  );
}
