import React, { useCallback, useEffect, useState } from 'react';
import { Ellipsis, MessageCircle, SquarePen } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  createProjectPost,
  getProjectPosts,
} from '../../api/TeamPage.js';
import { getActiveProjects, getCompletedProjects } from '../../api/Project/projectApi.js';
import Pagination from '../../components/Pagination/Pagination.jsx';
import PostModal from '../TeamPage/components/PostModal.jsx';
import '../TeamPage/TeamPage.css';
import './BoardPage.css';

const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return String(dateString).replace(/-/g, '.');

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const getCommentCount = (post) =>
  post.commentCount ??
  post.commentsCount ??
  post.replyCount ??
  post.commentList?.length ??
  post.comments?.length ??
  0;

const POSTS_PER_PAGE = 5;

function BoardPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = Number(searchParams.get('projectId'));
  const [projectTitle, setProjectTitle] = useState(
    location.state?.projectTitle || searchParams.get('projectTitle') || ''
  );

  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [isPostSubmitting, setIsPostSubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (!projectId) {
      setError('프로젝트 ID가 유효하지 않습니다.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const nextPosts = await getProjectPosts(projectId);
      const nextTotalPages = Math.max(1, Math.ceil(nextPosts.length / POSTS_PER_PAGE));
      setPosts(nextPosts);
      setCurrentPage((page) => Math.min(page, nextTotalPages));
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (projectTitle || !projectId) return;

    const fetchProjectTitle = async () => {
      const responses = await Promise.allSettled([
        getActiveProjects(),
        getCompletedProjects(),
      ]);

      const projects = responses.flatMap((result) =>
        result.status === 'fulfilled' && Array.isArray(result.value.data?.data)
          ? result.value.data.data
          : []
      );
      const currentProject = projects.find((project) => Number(project.projectId) === projectId);

      if (currentProject?.title) {
        setProjectTitle(currentProject.title);
      }
    };

    fetchProjectTitle();
  }, [projectId, projectTitle]);

  const handlePostClick = (postId) => {
    const nextSearchParams = new URLSearchParams({ projectId: String(projectId) });
    if (projectTitle) nextSearchParams.set('projectTitle', projectTitle);

    navigate(`/board/${postId}?${nextSearchParams.toString()}`, {
      state: { projectTitle, dueDate: location.state?.dueDate },
    });
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setPostTitle('');
    setPostContent('');
    setIsPostModalOpen(true);
  };

  const closePostModal = () => {
    if (isPostSubmitting) return;
    setIsPostModalOpen(false);
    setPostTitle('');
    setPostContent('');
  };

  const handlePostSubmit = async () => {
    if (!postTitle.trim() || !postContent.trim() || isPostSubmitting) return;

    try {
      setIsPostSubmitting(true);
      const payload = {
        title: postTitle.trim(),
        content: postContent.trim(),
        postType: 'GENERAL',
      };

      await createProjectPost(projectId, payload);
      setCurrentPage(1);

      setIsPostModalOpen(false);
      setPostTitle('');
      setPostContent('');
      await fetchPosts();
    } catch (submitError) {
      alert(`게시글 처리에 실패했습니다: ${submitError.message}`);
    } finally {
      setIsPostSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const currentPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <section className="project-board" aria-labelledby="project-board-title">
      <div className="project-board__content">
        <header className="project-board__header">
          <h1 id="project-board-title" className="project-board__title">
            <button
              type="button"
              className="project-board__title-button"
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
          <span className="project-board__more" aria-hidden="true">
            <Ellipsis size={24} aria-hidden="true" />
          </span>
        </header>

        <div className="project-board__toolbar">
          <button type="button" className="project-board__write-button" onClick={openCreateModal}>
            <SquarePen size={16} aria-hidden="true" />
            <span>게시글 쓰기</span>
          </button>
        </div>

        <div
          className={`project-board__list ${totalPages > 1 ? 'project-board__list--paginated' : ''}`}
          aria-label="게시글 목록"
          aria-busy={isLoading}
        >
          {isLoading && <p className="project-board__status">불러오는 중...</p>}
          {!isLoading && error && <p className="project-board__status project-board__status--error">{error}</p>}
          {!isLoading && !error && posts.length === 0 && (
            <p className="project-board__empty-state">등록된 게시글이 없습니다.</p>
          )}

          {!isLoading && !error && currentPosts.map((post) => (
            <article
              key={post.postId}
              className="project-board__card"
              role="button"
              tabIndex={0}
              onClick={() => handlePostClick(post.postId)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handlePostClick(post.postId);
                }
              }}
            >
              <div className="project-board__post-info">
                <h2 className="project-board__post-title">{post.title}</h2>
                <div className="project-board__meta">
                  <span>{post.writerName || post.authorName || '작성자'}</span>
                  <span className="project-board__divider" aria-hidden="true" />
                  <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                </div>
              </div>
              <span className="project-board__comments" aria-label={`댓글 ${getCommentCount(post)}개`}>
                <MessageCircle size={16} aria-hidden="true" />
                댓글 {getCommentCount(post)}
              </span>
            </article>
          ))}
        </div>

        {!isLoading && !error && posts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <PostModal
        isOpen={isPostModalOpen}
        isEditMode={isEditMode}
        title={postTitle}
        setTitle={setPostTitle}
        content={postContent}
        setContent={setPostContent}
        onClose={closePostModal}
        onSubmit={handlePostSubmit}
        isSubmitting={isPostSubmitting}
      />

    </section>
  );
}

export default BoardPage;
