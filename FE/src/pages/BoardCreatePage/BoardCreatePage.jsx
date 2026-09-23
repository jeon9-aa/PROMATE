import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createProjectPost, getPostDetail, updateProjectPost } from '../../api/TeamPage.js';
import '../BoardDetailPage/BoardDetailPage.css';
import './BoardCreatePage.css';

export default function BoardCreatePage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { postId: postIdParam } = useParams();
  const isEditMode = postIdParam != null;
  const postId = Number(postIdParam);
  const isValidPost = !isEditMode || (Number.isSafeInteger(postId) && postId > 0);
  const projectId = Number(searchParams.get('projectId'));
  const projectTitle = location.state?.projectTitle || searchParams.get('projectTitle') || '';
  const isValidProject = Number.isSafeInteger(projectId) && projectId > 0;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('GENERAL');
  const [loadedPostKey, setLoadedPostKey] = useState(null);
  const postKey = `${projectId}/${postId}`;
  const isLoading = isEditMode && loadedPostKey !== postKey;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);
  const params = new URLSearchParams({ projectId: String(projectId) });
  if (projectTitle) params.set('projectTitle', projectTitle);
  const boardUrl = isValidProject ? `/board?${params.toString()}` : '/project';
  const navigationState = { projectTitle, dueDate: location.state?.dueDate };
  const detailUrl = `/board/${postId}?${params.toString()}`;

  useEffect(() => {
    if (!isEditMode || !isValidProject || !isValidPost) return;
    let active = true;
    getPostDetail(projectId, postId).then((post) => {
      if (!active) return;
      setTitle(post.title ?? '');
      setContent(post.content ?? '');
      setPostType(post.postType || 'GENERAL');
      setError('');
      setLoadedPostKey(postKey);
    }).catch((fetchError) => {
      if (active) setError(fetchError.message || '게시글을 불러오지 못했습니다.');
    });
    return () => { active = false; };
  }, [isEditMode, isValidProject, isValidPost, projectId, postId, postKey]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValidProject || !isValidPost || isLoading || !title.trim() || !content.trim() || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        postType,
      };
      if (isEditMode) await updateProjectPost(projectId, postId, payload);
      else await createProjectPost(projectId, payload);
      navigate(isEditMode ? detailUrl : boardUrl, { replace: true, state: navigationState });
    } catch (submitError) {
      setError(submitError.message || '게시글 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const destination = isEditMode && isValidProject && isValidPost ? detailUrl
      : location.state?.fromProject && isValidProject ? `/project/${projectId}` : boardUrl;
    navigate(destination, { replace: true, state: navigationState });
  };

  return (
    <section className="board-detail board-create" aria-labelledby="board-create-heading">
      <div className="board-detail__content">
        <header className="board-detail__page-header">
          <h1 id="board-create-heading" className="board-detail__page-title">
            <button type="button" className="board-detail__title-button" disabled={isSubmitting}
              onClick={() => navigate(isValidProject ? `/project/${projectId}` : '/project', { state: navigationState })}>
              {projectTitle ? `${projectTitle} | 게시판` : '게시판'}
            </button>
          </h1>
        </header>

        <form className="board-create__form" onSubmit={handleSubmit} aria-labelledby="board-create-form-title" aria-busy={isSubmitting}>
          <h2 id="board-create-form-title">{isEditMode ? '게시글 수정' : '게시글 쓰기'}</h2>
          {isLoading && isValidProject && isValidPost && !error && <p role="status">게시글을 불러오는 중...</p>}
          <label className="board-create__field">
            <span>제목</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)}
              placeholder="제목을 적어주세요." required disabled={isSubmitting || isLoading || !isValidProject || !isValidPost} />
          </label>
          <label className="board-create__field">
            <span>내용</span>
            <textarea value={content} onChange={(event) => setContent(event.target.value)}
              placeholder="내용을 적어주세요." required disabled={isSubmitting || isLoading || !isValidProject || !isValidPost} />
          </label>
          {(!isValidProject || !isValidPost || error) && (
            <p className="board-create__error" role="alert">
              {!isValidProject ? '프로젝트 ID가 유효하지 않습니다. 프로젝트에서 다시 접근해주세요.' : !isValidPost ? '게시글 ID가 유효하지 않습니다.' : error}
            </p>
          )}
          <div className="board-create__actions">
            <button type="button" className="board-create__cancel" onClick={handleCancel} disabled={isSubmitting}>취소</button>
            <button type="submit" className="board-create__submit" disabled={!isValidProject || !isValidPost || isLoading || !title.trim() || !content.trim() || isSubmitting}>
              {isSubmitting ? '저장 중...' : isEditMode ? '수정 완료' : '게시글 생성'}
            </button>
          </div>
        </form>

        <button type="button" className="board-detail__back-button" disabled={isSubmitting}
          onClick={() => navigate(boardUrl, { replace: true, state: navigationState })}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>목록</span>
        </button>
      </div>
    </section>
  );
}
