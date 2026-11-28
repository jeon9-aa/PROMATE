import GuardedButton from '../../../components/GuardedButton/GuardedButton.jsx';
import React, { useState } from 'react';

function PostDetailModal({
  isOpen,
  post,
  isLoading,
  error,
  onClose,
  onEdit,
  onDelete,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isOpen || !post) return null;

  const handleClose = () => {
    setIsMenuOpen(false);
    onClose();
  };

  return (
    <div
      className="team-detail-overlay"
      role="presentation"
      onMouseDown={handleClose}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000,
      }}
    >
      <article
        className="team-detail-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="team-detail-header">
          <div className="team-detail-more-container">
            <GuardedButton
              type="button"
              className="team-detail-more-btn"
              aria-label="게시글 메뉴"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <span className="team-detail-more-icon" />
            </GuardedButton>
            {isMenuOpen && (
              <div className="team-detail-dropdown-menu">
                <GuardedButton
                  type="button"
                  className="team-detail-dropdown-item"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit();
                  }}
                >
                  수정
                </GuardedButton>
                <GuardedButton
                  type="button"
                  className="team-detail-dropdown-item delete"
                  onClick={() => {
                    setIsMenuOpen(false);
                    return onDelete();
                  }}
                >
                  삭제
                </GuardedButton>
              </div>
            )}
          </div>
          <GuardedButton type="button" className="team-detail-close-btn" onClick={handleClose} aria-label="닫기">
            ✕
          </GuardedButton>
        </div>

        <div className="team-detail-body">
          {isLoading && <p className="team-member-status">게시글을 불러오는 중...</p>}
          {error && <p className="team-member-status" style={{ color: 'red' }}>{error}</p>}

          {!isLoading && !error && post.title && (
            <>
              <h2 id="post-detail-title" className="team-detail-title">{post.title}</h2>

              <div className="team-detail-info">
                <div className="team-detail-info-row">
                  <span className="team-detail-info-label">작성자</span>
                  <span className="team-detail-info-value">
                    {post.writerName ?? post.authorName ?? '작성자'}
                  </span>
                </div>
              </div>

              <div className="team-detail-divider" />

              <div className="team-detail-content-wrapper">
                <p className="team-detail-content">{post.content}</p>
              </div>
            </>
          )}
        </div>
      </article>
    </div>
  );
}

export default PostDetailModal;
