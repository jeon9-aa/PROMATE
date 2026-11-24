import '../../components/TeamPageMenu/ProjectTitleButton.css';
import TeamPageMenu from '../../components/TeamPageMenu/TeamPageMenu.jsx';
import GuardedButton from '../../components/GuardedButton/GuardedButton.jsx';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { getProjectSubgroup, getProjectSubgroupMembers, joinProjectSubgroup } from '../../api/Project/projectApi';
import profileIcon from '../../assets/icons/profileIcon.svg';
import { getSecureImageUrl } from '../../utils/imageUrl';
import useProjectTitle from '../../utils/useProjectTitle';
import { isSmallMeetingClosed, useSmallMeetingClock } from '../../utils/smallMeetings';
import './SmallMeetingDetailPage.css';

const formatDate = (date) => (date ? date.replaceAll('-', '.') : '미정');

export default function SmallMeetingDetailPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { projectId, meetingId } = useParams();
  const projectTitle = useProjectTitle(projectId, state?.projectTitle);
  const [result, setResult] = useState(null);
  const [memberResult, setMemberResult] = useState(null);
  const currentResult = result?.projectId === projectId && result?.meetingId === meetingId ? result : null;
  const subgroup = currentResult?.subgroup;
  const hasJoined = subgroup?.joined === true;
  const currentMembers = memberResult?.projectId === projectId
    && memberResult?.meetingId === meetingId && memberResult.hasJoined === hasJoined ? memberResult : null;
  const hasSubgroup = Boolean(subgroup);
  const now = useSmallMeetingClock();
  const isClosed = isSmallMeetingClosed(subgroup, now);
  const canJoin = Boolean(subgroup) && !hasJoined && !isClosed;

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

  useEffect(() => {
    if (!hasSubgroup) return;

    const controller = new AbortController();
    getProjectSubgroupMembers(projectId, meetingId, controller.signal)
      .then((members) => {
        if (!controller.signal.aborted) setMemberResult({ projectId, meetingId, hasJoined, members });
      })
      .catch(() => {
        if (!controller.signal.aborted) setMemberResult({ projectId, meetingId, hasJoined, error: true });
      });

    return () => controller.abort();
  }, [projectId, meetingId, hasSubgroup, hasJoined]);

  const handleJoin = async () => {
    if (!canJoin || isSmallMeetingClosed(subgroup, Date.now())) return;

    try {
      const { status, currentCount, capacity } = await joinProjectSubgroup(projectId, meetingId);
      setResult((previous) => previous === currentResult ? {
        ...previous,
        joinError: '',
        subgroup: { ...previous.subgroup, status, currentCount, capacity, joined: true },
      } : previous);
    } catch (error) {
      const joinError = error.response?.data?.message || '소모임에 참여하지 못했습니다. 다시 시도해 주세요.';
      setResult((previous) => previous === currentResult ? { ...previous, joinError } : previous);
    }
  };

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
                {!isClosed && subgroup.status === 'RECRUITING' && <span className="small-meeting-badge">모집 중</span>}
                {isClosed && <span className="small-meeting-badge is-closed">마감</span>}
              </div>
              {hasJoined ? (
                <span role="status">참여 완료</span>
              ) : (
                <GuardedButton className="small-meeting-join" type="button" onClick={handleJoin} disabled={!canJoin}>
                  참여하기
                </GuardedButton>
              )}
            </div>
            {currentResult.joinError && <p role="alert">{currentResult.joinError}</p>}
            {subgroup.description && <p className="small-meeting-description">{subgroup.description}</p>}
            <div className="small-meeting-meta">
              <span><Users size={16} aria-hidden="true" /> 모집 인원 {subgroup.currentCount}/{subgroup.capacity}</span>
              <span className="small-meeting-meta-divider" aria-hidden="true" />
              <span>{formatDate(subgroup.startDate)} ~ {formatDate(subgroup.endDate)}</span>
            </div>
            <section className="small-meeting-members" aria-labelledby="small-meeting-members-heading">
              <h3 id="small-meeting-members-heading">소모임 멤버</h3>
              {!currentMembers && <p role="status">멤버를 불러오는 중입니다.</p>}
              {currentMembers?.error && <p role="alert">멤버 목록을 불러오지 못했습니다.</p>}
              {currentMembers?.members?.length === 0 && <p>참여한 멤버가 없습니다.</p>}
              {currentMembers?.members?.length > 0 && (
                <ul className="small-meeting-member-list">
                  {currentMembers.members.map(({ userId, name, profileImageUrl, role }) => (
                    <li className="small-meeting-member" key={userId}>
                      <img src={getSecureImageUrl(profileImageUrl) || profileIcon} alt="" />
                      <span>{name}</span>
                      {role === 'LEADER' && <span className="small-meeting-member-role">리더</span>}
                      {role === 'MEMBER' && <span className="small-meeting-member-role">멤버</span>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </article>
        )}
        <GuardedButton className="small-meeting-back" type="button" onClick={() => navigate(`/project/${projectId}/smallMeetingList`, { state: { projectTitle } })}><ArrowLeft size={16} aria-hidden="true" /> 목록</GuardedButton>
      </div>
    </div>
  );
}


