import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { getCurrentUserId, getProjectGroups } from '../../utils/smallMeetings';
import useProjectTitle from '../../utils/useProjectTitle';
import './SmallMeetingDetailPage.css';

const formatDate = (date) => (date ? date.replaceAll('-', '.') : '모집 중');

export default function SmallMeetingDetailPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { projectId, meetingId } = useParams();
  const projectTitle = useProjectTitle(projectId, state?.projectTitle);
  const userId = getCurrentUserId();
  const participantStorageKey = `promate-small-meeting-joined:${projectId || 'default'}:${meetingId}:${userId}`;
  const [joinedThisVisit, setJoinedThisVisit] = useState({});
  const subgroup = String(state?.subgroup?.id) === meetingId ? state.subgroup : null;
  const group = getProjectGroups(projectId).find((item) => String(item.id) === String(meetingId));
  let joined = Boolean(joinedThisVisit[participantStorageKey]);
  try { joined ||= localStorage.getItem(participantStorageKey) === 'true'; } catch { /* Storage unavailable. */ }
  const members = group?.members ?? [];
  const participants = joined && !members.some((member) => String(member.userId) === userId)
    ? [...members, { userId, name: '나', role: '참여자' }]
    : members;

  const maxMembers = Number(group?.capacity) || 5;
  const hasJoined = participants.some((member) => String(member.userId) === userId);
  const isFull = participants.length >= maxMembers;
  const isClosed = Boolean(group?.closed || isFull);

  const handleJoin = () => {
    if (hasJoined || isClosed) return;
    setJoinedThisVisit((current) => ({ ...current, [participantStorageKey]: true }));
    try { localStorage.setItem(participantStorageKey, 'true'); } catch { /* Keep this visit's joined state. */ }
  };

  if (!group && !subgroup) return <div className="small-meeting-detail-page">소모임을 찾을 수 없습니다. 목록에서 다시 선택해 주세요.</div>;

  return (
    <div className="small-meeting-detail-page">
      <div className="small-meeting-detail-content">
        <header className="small-meeting-detail-header">
          <h1>{projectTitle} <span aria-hidden="true">|</span> 소모임</h1>
        </header>
        {subgroup ? (
          <article className="small-meeting-card">
            <h2>소모임 #{subgroup.id}</h2>
            {subgroup.grade != null && <p>학년 {subgroup.grade}</p>}
            {subgroup.comment && <p className="small-meeting-description">{subgroup.comment}</p>}
          </article>
        ) : <article className="small-meeting-card">
          <div className="small-meeting-card-heading">
            <div className="small-meeting-title-row">
              <h2>{group.title}</h2>
              <span className={`small-meeting-badge${isClosed ? ' is-closed' : ''}`}>{isClosed ? '마감' : '모집 중'}</span>
            </div>
            <button className={`small-meeting-join${hasJoined ? ' is-joined' : ''}`} type="button" onClick={handleJoin} disabled={isClosed || hasJoined}>
              <span>{hasJoined ? '참여 완료' : isFull ? '마감' : '참여'}</span>
            </button>
          </div>
          <p className="small-meeting-description">{group.description || 'React와 상태관리 라이브러리를 함께 공부해요. 매주 화요일 저녁에 온라인으로 모여 진행 상황을 공유합니다.'}</p>
          <div className="small-meeting-meta">
            <span><Users size={16} aria-hidden="true" /> 모집 인원 {participants.length}/{maxMembers}</span>
            <span className="small-meeting-meta-divider" aria-hidden="true" />
            <span>{formatDate(group.start)} ~ {formatDate(group.end)}</span>
          </div>
          <div className="small-meeting-members">
            <h3>참여 멤버 ({participants.length}명)</h3>
            <ul>{participants.map((member, index) => (
              <li key={member.userId ?? `${member.name}-${index}`}>
                <span className="small-meeting-avatar" aria-hidden="true">{member.name.slice(0, 1)}</span>
                <span className="small-meeting-member-name">{member.name}</span>
                <span className="small-meeting-member-role">{member.role}</span>
              </li>
            ))}</ul>
          </div>
        </article>}
        <button className="small-meeting-back" type="button" onClick={() => navigate(`/project/${projectId}/smallMeetingList`, { state: { projectTitle } })}><ArrowLeft size={16} aria-hidden="true" /> 목록</button>
      </div>
    </div>
  );
}


