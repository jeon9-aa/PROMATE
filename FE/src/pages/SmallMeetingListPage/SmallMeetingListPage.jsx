import '../../components/TeamPageMenu/ProjectTitleButton.css';
import TeamPageMenu from '../../components/TeamPageMenu/TeamPageMenu.jsx';
import { useEffect, useState } from 'react';
import GuardedButton from '../../components/GuardedButton/GuardedButton.jsx';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getProjectSubgroups } from '../../api/Project/projectApi';
import './SmallMeetingListPage.css';
import useProjectTitle from '../../utils/useProjectTitle';
import { isSmallMeetingClosed, useSmallMeetingClock } from '../../utils/smallMeetings';

const formatDate = (date) => date?.replaceAll('-', '.') ?? '미정';

export default function SmallMeetingListPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const projectTitle = useProjectTitle(projectId, state?.projectTitle);
  const [list, setList] = useState(null);
  const currentList = list?.projectId === projectId ? list : null;
  const now = useSmallMeetingClock();

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
          <h1>
            <GuardedButton type="button" className="project-title-button" data-tooltip="팀페이지로 이동"
              onClick={() => navigate(`/project/${projectId}`, { state: { projectTitle, dueDate: state?.dueDate } })}>
              {projectTitle} <span aria-hidden="true">|</span> 소모임
            </GuardedButton>
          </h1>
          <TeamPageMenu projectId={projectId} projectTitle={projectTitle} dueDate={state?.dueDate} currentPage="meetings" />
        </header>
        <section aria-label="소모임 목록">
          <div className="project-detail-actions">
            <GuardedButton type="button" onClick={() => navigate(`/project/${projectId}/smallMeeting/add`, { state: { projectTitle } })}>
              <Plus size={16} aria-hidden="true" />소모임 만들기
            </GuardedButton>
          </div>
          {!currentList && <p role="status">소모임 목록을 불러오는 중입니다.</p>}
          {currentList?.error && <p role="alert">소모임 목록을 불러오지 못했습니다.</p>}
          {currentList?.groups?.length === 0 && (
            <p className="small-meeting-list-empty" role="status">등록된 소모임이 없습니다.</p>
          )}
          {currentList?.groups?.length > 0 && (
            <ul className="project-detail-list">
              {currentList.groups.map((subgroup) => (
                <li className="project-detail-group" key={subgroup.subgroupId}>
                  <button
                    className="project-detail-group-button"
                    type="button"
                    onClick={() => navigate(`/project/${projectId}/smallMeeting/${subgroup.subgroupId}`, { state: { projectTitle, dueDate: state?.dueDate } })}
                  >
                    <span className="project-detail-group-info">
                      <span className="project-detail-group-title">{subgroup.name}</span>
                      {subgroup.description && (
                        <span className="project-detail-group-description">{subgroup.description}</span>
                      )}
                      <span className="project-detail-group-meta">
                        <span>모집 인원 {subgroup.currentCount}/{subgroup.capacity}</span>
                        {(subgroup.startDate || subgroup.endDate) && (
                          <span className="project-detail-period">
                            {formatDate(subgroup.startDate)} ~ {formatDate(subgroup.endDate)}
                          </span>
                        )}
                      </span>
                    </span>
                    {isSmallMeetingClosed(subgroup, now) ? (
                      <span className="project-detail-status is-closed">마감</span>
                    ) : subgroup.status === 'RECRUITING' && (
                      <span className="project-detail-status">모집 중</span>
                    )}
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
