import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getProjectSubgroups } from '../../api/Project/projectApi';
import './SmallMeetingListPage.css';
import useProjectTitle from '../../utils/useProjectTitle';

export default function SmallMeetingListPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const projectTitle = useProjectTitle(projectId, state?.projectTitle);
  const [list, setList] = useState(null);
  const currentList = list?.projectId === projectId ? list : null;

  useEffect(() => {
    const controller = new AbortController();

    getProjectSubgroups(projectId, controller.signal)
      .then((groups) => {
        if (!controller.signal.aborted) setList({ projectId, groups });
      })
      .catch(() => {
        if (!controller.signal.aborted) setList({ projectId, error: true });
      });

    return () => controller.abort();
  }, [projectId]);

  return (
    <div className="project-detail-page">
      <div className="project-detail-content">
        <header className="project-detail-header">
          <h1>{projectTitle} <span aria-hidden="true">|</span> 소모임</h1>
        </header>
        <section aria-label="소모임 목록">
          <div className="project-detail-actions">
            <button type="button" onClick={() => navigate(`/project/${projectId}/smallMeeting/add`, { state: { projectTitle } })}>
              <Plus size={16} aria-hidden="true" />소모임 만들기
            </button>
          </div>
          {!currentList && <p role="status">소모임 목록을 불러오는 중입니다.</p>}
          {currentList?.error && <p role="alert">소모임 목록을 불러오지 못했습니다.</p>}
          {currentList?.groups?.length === 0 && <p>등록된 소모임이 없습니다.</p>}
          {currentList?.groups?.length > 0 && (
            <ul className="project-detail-list">
              {currentList.groups.map((subgroup) => (
                <li className="project-detail-group" key={subgroup.id}>
                  <button
                    className="project-detail-group-button"
                    type="button"
                    onClick={() => navigate(`/project/${projectId}/smallMeeting/${subgroup.id}`, { state: { subgroup, projectTitle } })}
                  >
                    <span className="project-detail-group-info">
                      <span className="project-detail-group-title">{subgroup.comment || `소모임 #${subgroup.id}`}</span>
                      {subgroup.grade != null && <span className="project-detail-group-meta">학년 {subgroup.grade}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
