import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ProjectGroupCard from './components/ProjectGroupCard';
import './SmallMeetingListPage.css';
import { getProjectTasks } from '../../api/TeamPage';

export const sampleGroups = [
  {
    id: 1,
    title: '프론트엔드 스터디',
    owner: '아무개',
    start: '2026-03-17',
    end: '',
    closed: false,
    members: [
      { userId: 'sample-1-owner', name: '김은비', role: '개설자' },
      { userId: 'sample-1-member', name: '김철수', role: '참여자' },
    ],
  },
  {
    id: 2,
    title: '중간고사 스터디',
    owner: '아무개',
    start: '2026-03-17',
    end: '',
    closed: false,
    members: [
      { userId: 'sample-2-owner', name: '김영희', role: '개설자' },
    ],
  },
  {
    id: 3,
    title: '디자인시스템 스터디',
    owner: '아무개',
    start: '2026-03-17',
    end: '2026-07-23',
    closed: true,
    members: [],
  },
];

export default function SmallMeetingListPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const projectTitleCacheKey = `promate-project-title:${projectId || 'default'}`;
  const [projectTitle, setProjectTitle] = useState(() => {
    if (state?.projectTitle) return state.projectTitle;
    try { return sessionStorage.getItem(projectTitleCacheKey) || ''; } catch { return ''; }
  });
  useEffect(() => {
    if (state?.projectTitle) {
      setProjectTitle(state.projectTitle);
      try { sessionStorage.setItem(projectTitleCacheKey, state.projectTitle); } catch { /* Storage unavailable. */ }
      return;
    }
    if (!projectId || projectTitle) return;
    getProjectTasks(Number(projectId))
      .then((data) => {
        if (!data?.projectTitle) return;
        setProjectTitle(data.projectTitle);
        try { sessionStorage.setItem(projectTitleCacheKey, data.projectTitle); } catch { /* Storage unavailable. */ }
      })
      .catch(() => {});
  }, [projectId, projectTitle, projectTitleCacheKey, state?.projectTitle]);
  const [groups] = useState(() => {
    try {
      const savedGroups = JSON.parse(localStorage.getItem('promate-small-meetings') || '[]');
      return [...sampleGroups, ...savedGroups];
    } catch {
      return sampleGroups;
    }
  });

  return (
    <div className="project-detail-page">
      <div className="project-detail-content">
        <header className="project-detail-header">
          <h1>{projectTitle} <span aria-hidden="true">|</span> 소모임</h1>
        </header>
        <section aria-label="소모임 목록">
          <div className="project-detail-actions">
            <button type="button" onClick={() => navigate('/smallMeeting/add', { state: { projectTitle } })}>
              <Plus size={16} aria-hidden="true" /> 소모임 만들기
            </button>
          </div>
          <ul className="project-detail-list">
            {groups.map((group) => (
              <ProjectGroupCard
                key={group.id}
                group={group}
                onClick={() => navigate(`/project/${projectId}/smallMeeting/${group.id}`, { state: { group, projectTitle } })}
              />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
