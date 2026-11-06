import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { getProjectTasks } from '../../api/TeamPage';
import './SmallMeetingDetailPage.css';

const fallbackGroup = {
  id: 1,
  title: '프론트엔드 스터디',
  owner: '프로젝트 관리자',
  description: 'React와 상태관리 라이브러리를 함께 공부해요. 매주 정해진 요일에 모여 진행 상황을 공유합니다.',
  start: '2026-03-01',
  end: '',
  closed: false,
  capacity: 5,
};

const formatDate = (date) => (date ? date.replaceAll('-', '.') : '모집 중');

import { sampleGroups } from '../SmallMeetingListPage/SmallMeetingListPage';

export default function SmallMeetingDetailPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { projectId, meetingId } = useParams();
  const projectTitleCacheKey = `promate-project-title:${projectId || 'default'}`;
  const [loadedProject, setLoadedProject] = useState(null);
  let cachedProjectTitle = '';
  try { cachedProjectTitle = sessionStorage.getItem(projectTitleCacheKey) || ''; } catch { /* 브라우저 저장소를 사용할 수 없으면 저장 없이 진행 */ }
  const projectTitle = state?.projectTitle || cachedProjectTitle
    || (loadedProject?.id === projectId ? loadedProject.title : '');

  useEffect(() => {
    if (!projectId || projectTitle) return;
    let cancelled = false;
    getProjectTasks(Number(projectId))
      .then((data) => {
        if (cancelled || !data?.projectTitle) return;
        setLoadedProject({ id: projectId, title: data.projectTitle });
        try { sessionStorage.setItem(projectTitleCacheKey, data.projectTitle); } catch { /* 브라우저 저장소를 사용할 수 없으면 저장 없이 진행 */ }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [projectId, projectTitle, projectTitleCacheKey]);

  const [group, setGroup] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [userId, setUserId] = useState(() => {
    try {
      const token = localStorage.getItem('accessToken');
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return String(payload.userId ?? payload.user_id ?? payload.memberId ?? payload.member_id ?? payload.id ?? payload.sub ?? `token:${token}`);
    } catch {
      return `token:${localStorage.getItem('accessToken') || 'anonymous'}`;
    }
  });
  const participantStorageKey = `promate-small-meeting-joined:${projectId || 'default'}:${meetingId}:${userId}`;

useEffect(() => {
    let savedGroups = [];
    try {
      savedGroups = JSON.parse(localStorage.getItem('promate-small-meetings') || '[]');
      if (!Array.isArray(savedGroups)) savedGroups = [];
    } catch { /* Ignore invalid local data. */ }
    const nextGroup = [...sampleGroups, ...savedGroups].find((item) => String(item.id) === String(meetingId))
      || (String(state?.group?.id) === String(meetingId) ? state.group : null);
    setGroup(nextGroup || null);
    if (nextGroup) {
      const members = nextGroup.members ?? [];
      let joined = false;
      try { joined = localStorage.getItem(participantStorageKey) === 'true'; } catch { /* Storage unavailable. */ }
      setParticipants(joined && !members.some((member) => String(member.userId) === userId)
        ? [...members, { userId, name: '나', role: '참여자' }]
        : members);
    }
    setIsLoading(false);
  }, [meetingId, participantStorageKey, state?.group, userId]);

  const maxMembers = Number(group?.capacity) || 5;
  const hasJoined = participants.some((member) => String(member.userId) === userId);
  const isFull = participants.length >= maxMembers;
  const isClosed = Boolean(group?.closed || isFull);

  const handleJoin = () => {
    if (isJoining || hasJoined || isClosed) return;
    setIsJoining(true);
    setParticipants((current) => current.length >= maxMembers ? current : [...current, { userId, name: '나', role: '참여자' }]);
    try { localStorage.setItem(participantStorageKey, 'true'); } catch { /* Keep this visit's joined state. */ }
    setIsJoining(false);
  };

  if (isLoading) return <div className="small-meeting-detail-page">소모임 정보를 불러오는 중입니다...</div>;
  if (!group) return <div className="small-meeting-detail-page">소모임을 찾을 수 없습니다. 목록에서 다시 선택해 주세요.</div>;

  return (
    <div className="small-meeting-detail-page">
      <div className="small-meeting-detail-content">
        <header className="small-meeting-detail-header">
          <h1>{projectTitle} <span aria-hidden="true">|</span> 소모임</h1>
        </header>
        <article className="small-meeting-card">
          <div className="small-meeting-card-heading">
            <div className="small-meeting-title-row">
              <h2>{group.title}</h2>
              <span className={`small-meeting-badge${isClosed ? ' is-closed' : ''}`}>{isClosed ? '마감' : '모집 중'}</span>
            </div>
            <button className={`small-meeting-join${hasJoined ? ' is-joined' : ''}`} type="button" onClick={handleJoin} disabled={isClosed || hasJoined || isJoining}>
              <span>{isJoining ? '참여 중...' : hasJoined ? '참여 완료' : isFull ? '마감' : '참여'}</span>
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
        </article>
        <button className="small-meeting-back" type="button" onClick={() => navigate(`/project/${projectId}/smallMeetingList`, { state: { projectTitle } })}><ArrowLeft size={16} aria-hidden="true" /> 목록</button>
      </div>
    </div>
  );
}


