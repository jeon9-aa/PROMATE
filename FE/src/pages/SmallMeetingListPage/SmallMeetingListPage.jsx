import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ProjectGroupCard from './components/ProjectGroupCard';
import './SmallMeetingListPage.css';

const sampleGroups = [
  {
    id: 1,
    title: '프론트엔드 스터디',
    owner: '아무개',
    start: '2026-03-17',
    end: '',
    closed: false,
  },
  {
    id: 2,
    title: '중간고사 스터디',
    owner: '아무개',
    start: '2026-03-17',
    end: '',
    closed: false,
  },
  {
    id: 3,
    title: '디자인시스템 스터디',
    owner: '아무개',
    start: '2026-03-17',
    end: '2026-07-23',
    closed: true,
  },
];

export default function SmallMeetingListPage() {
  const { state } = useLocation();
  const projectTitle = state?.projectTitle || '캡스톤 디자인';

  return (
    <div className="project-detail-page">
      <div className="project-detail-content">
        <header className="project-detail-header">
          <h1>{projectTitle} <span aria-hidden="true">|</span> 소모임</h1>
        </header>
        <section aria-label="소모임 목록">
          <div className="project-detail-actions">
            <button type="button" disabled>
              <Plus size={16} aria-hidden="true" />소모임 만들기
            </button>
          </div>
          <ul className="project-detail-list">
            {sampleGroups.map((group) => (
              <ProjectGroupCard key={group.id} group={group} />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}