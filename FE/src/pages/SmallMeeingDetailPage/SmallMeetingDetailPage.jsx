import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
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

const initialMembers = [
  { name: '김은비', role: '개설자' },
  { name: '김철수', role: '참여자' },
  { name: '김영희', role: '참여자' },
];

const formatDate = (date) => (date ? date.replaceAll('-', '.') : '모집 중');

export default function SmallMeetingDetailPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const group = state?.group || fallbackGroup;
  const maxMembers = Number(group.capacity) || 5;
  const participantStorageKey = `promate-small-meeting-joined:${projectId || 'default'}:${group.id}:${encodeURIComponent(group.title || '')}`;
  const [participants, setParticipants] = useState(() => {
    const members = group.members || initialMembers;
    try {
      if (localStorage.getItem(participantStorageKey) === 'true' && !members.some((member) => member.name === '나')) {
        return [...members, { name: '나', role: '참여자' }];
      }
    } catch {
      // Continue with the members supplied by the list page when storage is unavailable.
    }
    return members;
  });
  const [isJoining, setIsJoining] = useState(false);
  const hasJoined = participants.some((member) => member.name === '나');
  const isFull = participants.length >= maxMembers;
  const isClosed = Boolean(group.closed || isFull);

  const handleJoin = async () => {
    if (isJoining || hasJoined || isClosed) return;

    setIsJoining(true);
    setParticipants((current) => (current.length >= maxMembers
      ? current
      : [...current, { name: '나', role: '참여자' }]));
    try {
      localStorage.setItem(participantStorageKey, 'true');
    } catch {
      // Keep this visit's joined state even when storage is unavailable.
    }
    setIsJoining(false);
  };

  return (
    <div className="small-meeting-detail-page">
      <div className="small-meeting-detail-content">
        <header className="small-meeting-detail-header">
          <h1>캡스톤 디자인 <span aria-hidden="true">|</span> 소모임</h1>
          <button className="small-meeting-more" type="button" aria-label="더 보기">···</button>
        </header>

        <article className="small-meeting-card">
          <div className="small-meeting-card-heading">
            <div className="small-meeting-title-row">
              <h2>{group.title}</h2>
              <span className={`small-meeting-badge${isClosed ? ' is-closed' : ''}`}>
                {isClosed ? '마감' : '모집 중'}
              </span>
            </div>
            <button
              className={`small-meeting-join${hasJoined ? ' is-joined' : ''}`}
              type="button"
              onClick={handleJoin}
              disabled={isClosed || hasJoined || isJoining}
            >
              <span>{isJoining ? '참여 중...' : hasJoined ? '참여 완료' : isFull ? '마감' : '참여'}</span>
            </button>
          </div>

          <p className="small-meeting-description">
            {group.description || 'React와 상태관리 라이브러리를 함께 공부해요. 매주 화요일 저녁에 온라인으로 모여 진행 상황을 공유합니다.'}
          </p>
          <div className="small-meeting-meta">
            <span><Users size={16} aria-hidden="true" /> 모집 인원 {participants.length}/{maxMembers}</span>
            <span className="small-meeting-meta-divider" aria-hidden="true" />
            <span>{formatDate(group.start)} ~ {formatDate(group.end)}</span>
          </div>

          <div className="small-meeting-members">
            <h3>참여 멤버 ({participants.length}명)</h3>
            <ul>
              {participants.map((member) => (
                <li key={member.name}>
                  <span className="small-meeting-avatar" aria-hidden="true">{member.name.slice(0, 1)}</span>
                  <span className="small-meeting-member-name">{member.name}</span>
                  <span className="small-meeting-member-role">{member.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
        <button className="small-meeting-back" type="button" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} aria-hidden="true" /> 목록
        </button>
      </div>
    </div>
  );
}
