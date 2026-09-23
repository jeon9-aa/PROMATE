import { useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { createProjectPost } from '../../api/TeamPage.js';
import '../BoardDetailPage/BoardDetailPage.css';
import './BoardCreatePage.css';

export default function BoardCreatePage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = Number(searchParams.get('projectId'));
  const projectTitle = location.state?.projectTitle || searchParams.get('projectTitle') || '';
  const isValidProject = Number.isSafeInteger(projectId) && projectId > 0;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);
  const params = new URLSearchParams({ projectId: String(projectId) });
  if (projectTitle) params.set('projectTitle', projectTitle);
  const boardUrl = isValidProject ? `/board?${params.toString()}` : '/project';
  const navigationState = { projectTitle, dueDate: location.state?.dueDate };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValidProject || !title.trim() || !content.trim() || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setError('');
    try {
      await createProjectPost(projectId, {
        title: title.trim(),
        content: content.trim(),
        postType: 'GENERAL',
      });
      navigate(boardUrl, { replace: true, state: navigationState });
    } catch (submitError) {
      setError(submitError.message || '게시글 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const destination = location.state?.fromProject && isValidProject ? `/project/${projectId}` : boardUrl;
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
          <h2 id="board-create-form-title">게시글 쓰기</h2>
          <label className="board-create__field">
            <span>제목</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)}
              placeholder="제목을 적어주세요." required disabled={isSubmitting || !isValidProject} />
          </label>
          <label className="board-create__field">
            <span>내용</span>
            <textarea value={content} onChange={(event) => setContent(event.target.value)}
              placeholder="내용을 적어주세요." required disabled={isSubmitting || !isValidProject} />
          </label>
          {(!isValidProject || error) && (
            <p className="board-create__error" role="alert">
              {!isValidProject ? '프로젝트 ID가 유효하지 않습니다. 프로젝트에서 다시 접근해주세요.' : error}
            </p>
          )}
          <div className="board-create__actions">
            <button type="button" className="board-create__cancel" onClick={handleCancel} disabled={isSubmitting}>취소</button>
            <button type="submit" className="board-create__submit" disabled={!isValidProject || !title.trim() || !content.trim() || isSubmitting}>
              {isSubmitting ? '생성 중...' : '게시글 생성'}
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
