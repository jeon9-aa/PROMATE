import GuardedButton from '../../components/GuardedButton/GuardedButton.jsx';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ProjectGroupCard from './components/ProjectGroupCard';
import './SmallMeetingListPage.css';
import { getProjectGroups } from '../../utils/smallMeetings';
import useProjectTitle from '../../utils/useProjectTitle';

export default function SmallMeetingListPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const projectTitle = useProjectTitle(projectId, state?.projectTitle);
  const groups = getProjectGroups(projectId);

  return (
    <div className="project-detail-page">
      <div className="project-detail-content">
        <header className="project-detail-header">
          <h1>{projectTitle} <span aria-hidden="true">|</span> 소모임</h1>
        </header>
        <section aria-label="소모임 목록">
          <div className="project-detail-actions">
            <GuardedButton type="button" onClick={() => navigate(`/project/${projectId}/smallMeeting/add`, { state: { projectTitle } })}>
              <Plus size={16} aria-hidden="true" />소모임 만들기
            </GuardedButton>
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
