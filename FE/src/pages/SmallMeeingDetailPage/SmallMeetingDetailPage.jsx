import '../../components/TeamPageMenu/ProjectTitleButton.css';
import TeamPageMenu from '../../components/TeamPageMenu/TeamPageMenu.jsx';
import GuardedButton from '../../components/GuardedButton/GuardedButton.jsx';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { getProjectSubgroup } from '../../api/Project/projectApi';
import useProjectTitle from '../../utils/useProjectTitle';
import './SmallMeetingDetailPage.css';

const formatDate = (date) => (date ? date.replaceAll('-', '.') : '미정');

export default function SmallMeetingDetailPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { projectId, meetingId } = useParams();
  const projectTitle = useProjectTitle(projectId, state?.projectTitle);
  const [result, setResult] = useState(null);
  const currentResult = result?.projectId === projectId && result?.meetingId === meetingId ? result : null;
  const subgroup = currentResult?.subgroup;

  useEffect(() => {
    const controller = new AbortController();
    getProjectSubgroup(projectId, meetingId, controller.signal)
      .then((subgroup) => {
        if (controller.signal.aborted) return;
        setResult({ projectId, meetingId, subgroup });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setResult({ projectId, meetingId, error: error.response?.status !== 404 });
      });

    return () => controller.abort();
  }, [projectId, meetingId]);

  return (
    <div className="small-meeting-detail-page">
      <div className="small-meeting-detail-content">
        <header className="small-meeting-detail-header">
          <h1>
            <GuardedButton type="button" className="project-title-button" data-tooltip="팀페이지로 이동"
              onClick={() => navigate(`/project/${projectId}`, { state: { projectTitle, dueDate: state?.dueDate } })}>
              {projectTitle} <span aria-hidden="true">|</span> 소모임
            </GuardedButton>
          </h1>
          <TeamPageMenu projectId={projectId} projectTitle={projectTitle} dueDate={state?.dueDate} currentPage="meetings" />
        </header>
        {!currentResult && <p role="status">소모임을 불러오는 중입니다.</p>}
        {currentResult?.error && <p role="alert">소모임을 불러오지 못했습니다.</p>}
        {currentResult && !currentResult.error && !subgroup && (
          <p role="status">소모임을 찾을 수 없습니다.</p>
        )}
        {subgroup && (
          <article className="small-meeting-card">
            <div className="small-meeting-card-heading">
              <div className="small-meeting-title-row">
                <h2>{subgroup.name}</h2>
                {subgroup.status === 'RECRUITING' && <span className="small-meeting-badge">모집 중</span>}
                {subgroup.status === 'COMPLETED' && <span className="small-meeting-badge is-closed">마감</span>}
              </div>
              {subgroup.joined && <span>참여 완료</span>}
            </div>
            {subgroup.description && <p className="small-meeting-description">{subgroup.description}</p>}
            <div className="small-meeting-meta">
              <span><Users size={16} aria-hidden="true" /> 모집 인원 {subgroup.currentCount}/{subgroup.capacity}</span>
              <span className="small-meeting-meta-divider" aria-hidden="true" />
              <span>{formatDate(subgroup.startDate)} ~ {formatDate(subgroup.endDate)}</span>
            </div>
          </article>
        )}
        <GuardedButton className="small-meeting-back" type="button" onClick={() => navigate(`/project/${projectId}/smallMeetingList`, { state: { projectTitle } })}><ArrowLeft size={16} aria-hidden="true" /> 목록</GuardedButton>
      </div>
    </div>
  );
}


