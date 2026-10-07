import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Ellipsis } from 'lucide-react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  createPostComment,
  deletePostComment,
  deleteProjectPost,
  getPostComments,
  getPostDetail,
  updatePostComment,
} from '../../api/TeamPage.js';
import ProfileAvatar from '../../components/ProfileAvatar/ProfileAvatar.jsx';
import './BoardDetailPage.css';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10).replace(/-/g, '.');
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

function CommentTextarea({ value, ...props }) {
  const inputRef = useRef(null);

  useLayoutEffect(() => {
    const input = inputRef.current;
    const resize = () => {
      input.style.height = 'auto';
      input.style.height = `${input.scrollHeight + input.offsetHeight - input.clientHeight}px`;
    };
    resize();
    let previousWidth = input.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const width = input.getBoundingClientRect().width;
      if (width !== previousWidth) {
        previousWidth = width;
        resize();
      }
    });
    observer.observe(input);
    return () => observer.disconnect();
  }, [value]);

  return <textarea {...props} ref={inputRef} value={value} rows={1} />;
}

function CommentAvatar({ comment }) {
  const imageUrl = comment.profileImageUrl ?? comment.writerProfileImageUrl ?? comment.imageUrl;
  const writer = comment.writer ?? comment.writerName ?? comment.authorName ?? comment.nickname ?? '작성자';

  return (
    <ProfileAvatar
      src={imageUrl}
      alt={`${writer} 프로필 이미지`}
      className="board-detail__avatar"
      size="40px"
    />
  );
}

function BoardDetailPage() {
  const { postId: postIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const postId = Number(postIdParam);
  const projectId = Number(searchParams.get('projectId'));
  const projectTitle = location.state?.projectTitle || searchParams.get('projectTitle') || '';

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState('');
  const [comment, setComment] = useState('');
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [isCommentEditSubmitting, setIsCommentEditSubmitting] = useState(false);
  const commentEditPending = useRef(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const commentDeletePending = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const boardUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', String(projectId));
    if (projectTitle) params.set('projectTitle', projectTitle);
    const query = params.toString();
    return `/board${query ? `?${query}` : ''}`;
  }, [projectId, projectTitle]);

  const fetchPost = useCallback(async () => {
    if (!projectId || !postId) {
      setError('게시글 정보를 불러올 수 없습니다.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setPost(await getPostDetail(projectId, postId));
    } catch (fetchError) {
      setError(fetchError.message || '게시글을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [postId, projectId]);

  const fetchComments = useCallback(async () => {
    if (!projectId || !postId) {
      setComments([]);
      setCommentCount(0);
      setCommentsError('댓글 정보를 불러올 수 없습니다.');
      setIsCommentsLoading(false);
      return;
    }

    try {
      setIsCommentsLoading(true);
      setCommentsError('');
      const data = await getPostComments(projectId, postId);
      const commentList = Array.isArray(data?.commentList) ? data.commentList : [];

      setComments(commentList);
      setCommentCount(Number.isFinite(data?.count) ? data.count : commentList.length);
    } catch (fetchError) {
      setComments([]);
      setCommentCount(0);
      setCommentsError(fetchError.message || '댓글을 불러오지 못했습니다.');
    } finally {
      setIsCommentsLoading(false);
    }
  }, [postId, projectId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const content = comment.trim();
    if (!content || isCommentSubmitting || commentDeletePending.current) return;

    try {
      setIsCommentSubmitting(true);
      await createPostComment(projectId, postId, content);
      setComment('');
      await fetchComments();
    } catch (submitError) {
      window.alert(`댓글 등록에 실패했습니다: ${submitError.message}`);
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleCommentEditSubmit = async (event) => {
    event.preventDefault();
    const content = editComment.trim();
    if (!content || editingCommentId == null || commentEditPending.current) return;

    commentEditPending.current = true;
    setIsCommentEditSubmitting(true);
    try {
      const updated = await updatePostComment(projectId, postId, editingCommentId, content);
      setComments((current) => current.map((item) => (
        item.commentId === editingCommentId
          ? { ...item, comment: content, updatedAt: updated.updatedAt }
          : item
      )));
      setEditingCommentId(null);
      setEditComment('');
    } catch (submitError) {
      window.alert(`댓글 수정에 실패했습니다: ${submitError.message}`);
    } finally {
      commentEditPending.current = false;
      setIsCommentEditSubmitting(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (commentDeletePending.current || isCommentSubmitting || editingCommentId != null) return;
    if (!window.confirm('이 댓글을 삭제하시겠습니까?')) return;

    commentDeletePending.current = true;
    setDeletingCommentId(commentId);
    try {
      await deletePostComment(projectId, postId, commentId);
      setComments((current) => current.filter((item) => item.commentId !== commentId));
      setCommentCount((count) => Math.max(0, count - 1));
    } catch (deleteError) {
      window.alert(`댓글 삭제에 실패했습니다: ${deleteError.message}`);
    } finally {
      commentDeletePending.current = false;
      setDeletingCommentId(null);
    }
  };

  const openEditPage = () => {
    const params = new URLSearchParams({ projectId: String(projectId), projectTitle });
    navigate(`/board/${postId}/edit?${params.toString()}`, {
      state: { projectTitle, dueDate: location.state?.dueDate },
    });
  };

  const handleDelete = async () => {
    setIsMenuOpen(false);
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

    try {
      await deleteProjectPost(projectId, postId);
      navigate(boardUrl, { replace: true, state: { projectTitle, dueDate: location.state?.dueDate } });
    } catch (deleteError) {
      window.alert(`게시글 삭제에 실패했습니다: ${deleteError.message}`);
    }
  };

  return (
    <section className="board-detail" aria-labelledby="board-detail-heading">
      <div className="board-detail__content">
        <header className="board-detail__page-header">
          <h1 id="board-detail-heading" className="board-detail__page-title">
            <button
              type="button"
              className="board-detail__title-button"
              onClick={() => navigate(`/project/${projectId}`, {
                state: {
                  projectTitle,
                  dueDate: location.state?.dueDate,
                },
              })}
            >
              {projectTitle ? `${projectTitle} | 게시판` : '게시판'}
            </button>
          </h1>

          {!isLoading && !error && post && (
            <div className="board-detail__menu" ref={menuRef}>
              <button
                type="button"
                className="board-detail__menu-button"
                aria-label="게시글 메뉴"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
              >
                <Ellipsis size={24} />
              </button>
              {isMenuOpen && (
                <div className="board-detail__menu-popup">
                  <button type="button" onClick={openEditPage}>수정</button>
                  <button type="button" className="board-detail__delete" onClick={handleDelete}>삭제</button>
                </div>
              )}
            </div>
          )}
        </header>

        {isLoading && <div className="board-detail__status">게시글을 불러오는 중...</div>}
        {!isLoading && error && <div className="board-detail__status board-detail__status--error">{error}</div>}

        {!isLoading && !error && post && (
          <div className="board-detail__cards">
            <article className="board-detail__post-card">
              <h2 className="board-detail__post-title">{post.title}</h2>
              <div className="board-detail__post-meta">
                <span>{post.writerName ?? post.authorName ?? '작성자'}</span>
                <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
              </div>
              <div className="board-detail__divider" />
              <p className="board-detail__post-body">{post.content}</p>
            </article>

            <section className="board-detail__comment-card" aria-labelledby="comment-heading">
              <h2 id="comment-heading" className="board-detail__comment-title">
                댓글 {commentCount}개
              </h2>

              <div className="board-detail__comment-list">
                {isCommentsLoading && (
                  <p className="board-detail__no-comments">댓글을 불러오는 중...</p>
                )}
                {!isCommentsLoading && commentsError && (
                  <p className="board-detail__no-comments">{commentsError}</p>
                )}
                {!isCommentsLoading && !commentsError && comments.map((item, index) => {
                  const writer = item.writer ?? item.writerName ?? item.authorName ?? item.nickname ?? '작성자';
                  const createdAt = item.createdAt ?? item.updatedAt;
                  return (
                    <article className="board-detail__comment" key={item.commentId ?? item.replyId ?? index}>
                      <CommentAvatar comment={item} />
                      <div className="board-detail__comment-content">
                        <div className="board-detail__comment-meta">
                          <strong>{writer}</strong>
                          <time dateTime={createdAt}>{formatDate(createdAt)}</time>
                          {item.commentId != null && editingCommentId !== item.commentId && (
                            <div className="board-detail__comment-actions">
                            <button
                              type="button"
                              className="board-detail__comment-edit-button"
                              disabled={editingCommentId != null || isCommentSubmitting || deletingCommentId != null}
                              onClick={() => {
                                setEditingCommentId(item.commentId);
                                setEditComment(item.comment ?? item.content ?? item.commentContent ?? item.text ?? '');
                              }}
                            >수정</button>
                            <button
                              type="button"
                              className="board-detail__comment-edit-button board-detail__comment-delete-button"
                              disabled={editingCommentId != null || isCommentSubmitting || deletingCommentId != null}
                              onClick={() => handleCommentDelete(item.commentId)}
                            >{deletingCommentId === item.commentId ? '삭제 중' : '삭제'}</button>
                            </div>
                          )}
                        </div>
                        {editingCommentId != null && editingCommentId === item.commentId ? (
                          <form className="board-detail__comment-edit-form" onSubmit={handleCommentEditSubmit}>
                            <label className="board-detail__sr-only" htmlFor={`edit-comment-${item.commentId}`}>댓글 수정</label>
                            <CommentTextarea
                              id={`edit-comment-${item.commentId}`}
                              value={editComment}
                              onChange={(event) => setEditComment(event.target.value)}
                              disabled={isCommentEditSubmitting}
                              autoFocus
                            />
                            <button type="submit" disabled={isCommentEditSubmitting || !editComment.trim()}>
                              {isCommentEditSubmitting ? '저장 중' : '저장'}
                            </button>
                            <button type="button" disabled={isCommentEditSubmitting} onClick={() => {
                              setEditingCommentId(null);
                              setEditComment('');
                            }}>취소</button>
                          </form>
                        ) : (
                          <p>{item.comment ?? item.content ?? item.commentContent ?? item.text}</p>
                        )}
                      </div>
                    </article>
                  );
                })}
                {!isCommentsLoading && !commentsError && comments.length === 0 && (
                  <p className="board-detail__no-comments">등록된 댓글이 없습니다.</p>
                )}
              </div>

              <form className="board-detail__comment-form" onSubmit={handleCommentSubmit}>
                <label className="board-detail__sr-only" htmlFor="board-comment">댓글 입력</label>
                <CommentTextarea
                  id="board-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
                    event.preventDefault();
                    if (!event.repeat) event.currentTarget.form.querySelector('button[type="submit"]').click();
                  }}
                  placeholder="댓글을 입력해주세요."
                  disabled={isCommentSubmitting || isCommentEditSubmitting || deletingCommentId != null}
                />
                <button type="submit" disabled={isCommentSubmitting || isCommentEditSubmitting || deletingCommentId != null || !comment.trim()}>
                  {isCommentSubmitting ? '등록 중' : '등록'}
                </button>
              </form>
            </section>
          </div>
        )}

        <button
          type="button"
          className="board-detail__back-button"
          onClick={() => navigate(boardUrl, { state: { projectTitle, dueDate: location.state?.dueDate } })}
        >
          <ArrowLeft size={16} />
          <span>목록</span>
        </button>
      </div>

    </section>
  );
}

export default BoardDetailPage;
