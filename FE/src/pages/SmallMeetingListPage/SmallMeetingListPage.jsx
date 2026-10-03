import { useState } from 'react';
import { ArrowLeft, Ellipsis, Plus } from 'lucide-react';
import ProjectGroupCard from './components/ProjectGroupCard';
import './components/SmallMeetingListPage.css';

const sampleGroups = [
  {
    //첫번째 소모임
    id: 1,
    title: '프론트엔드 스터디',
    description: 'React 상태관리 라이브러리를 함께 공부해요. 매주 토요일 온라인으로 모여 진행 상황을 공유합니다.',
    owner: '아무개',
    start: '2026-03-17',
    end: '',
    closed: false,
    members: [
      { name: '김다빈', role: '개설자' },
      { name: '김철수', role: '참여자' },
      { name: '김상현', role: '참여자' },
    ],
  },
  {
    id: 2,
    title: '중간고사 스터디',
    description: 'React 상태관리 라이브러리를 함께 공부해요. 매주 토요일 온라인으로 모여 진행 상황을 공유합니다.',
    owner: '아무개',
    start: '2026-03-17',
    end: '',
    closed: false,
    members: [
      { name: '김다빈', role: '개설자' },
      { name: '김철수', role: '참여자' },
      { name: '김상현', role: '참여자' },
    ],
  },
  {
    id: 3,
    title: '디자인시스템 스터디',
    description: 'React 상태관리 라이브러리를 함께 공부해요. 매주 토요일 온라인으로 모여 진행 상황을 공유합니다.',
    owner: '아무개',
    start: '2026-03-17',
    end: '2026-07-23',
    closed: true,
    members: [
      { name: '김다빈', role: '개설자' },
      { name: '김철수', role: '참여자' },
      { name: '김상현', role: '참여자' },
    ],
  },
];

export default function SmallMeetingListPage() {
  const [selectedGroup, setSelectedGroup] = useState(null); // 지금 선택된 소모임 없음
  const [isCreating, setIsCreating] = useState(false);
  const [groups, setGroups] = useState(sampleGroups);
  const pageTitle = '캡스톤 디자인';

  const handleJoin = () => {
    const addCurrentUser = (group) => ({
      ...group,
      members: (group.members || []).some((member) => member.name === '나')
        ? group.members
        : [...(group.members || []), { name: '나', role: '참여자' }],
    });
    setGroups((current) => current.map((group) => group.id === selectedGroup.id ? addCurrentUser(group) : group));
    setSelectedGroup((current) => addCurrentUser(current));
  };

  const handleCreate = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = data.get('title').trim();
    setGroups((current) => [...current, {
      id: Date.now(), title, owner: '아무개',
      description: data.get('description').trim(),
      start: data.get('startDate'), end: data.get('endDate'), closed: false,
      members: [{ name: '나', role: '개설자' }],
    }]);
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <div className="project-detail-page">
        <div className="project-detail-content">
          <header className="project-detail-header">
            <h1>{pageTitle} <span aria-hidden="true">|</span> 소모임</h1>
            <button className="project-detail-more" type="button" aria-label="더 보기">
              <Ellipsis size={24} aria-hidden="true" />
            </button>
          </header>
          <form className="small-meeting-create-card" onSubmit={handleCreate}>
            <div className="small-meeting-create-fields">
              <label className="small-meeting-field small-meeting-field-wide">
                <span>소모임 이름</span>
                <input name="title" placeholder="소모임 이름을 적어주세요" maxLength={40} required />
              </label>
              <label className="small-meeting-field small-meeting-field-wide">
                <span>소모임 설명</span>
                <textarea name="description" placeholder="소모임에 대해 설명을 적어주세요" maxLength={500} />
              </label>
              <div className="small-meeting-create-secondary-fields">
                <label className="small-meeting-field small-meeting-field-capacity">
                  <span>모집 인원</span>
                  <select name="capacity" defaultValue="5">
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => <option key={count} value={count}>{count}명</option>)}
                  </select>
                </label>
                <div className="small-meeting-field small-meeting-field-period" role="group" aria-labelledby="small-meeting-period-label">
                  <span id="small-meeting-period-label">소모임 기간</span>
                  <div className="small-meeting-date-range">
                    <input aria-label="시작일" name="startDate" type="date" required />
                    <span aria-hidden="true">~</span>
                    <input aria-label="종료일" name="endDate" type="date" required />
                  </div>
                </div>
              </div>
            </div>
            <div className="small-meeting-create-actions">
              <button className="small-meeting-cancel" type="button" onClick={() => setIsCreating(false)}>취소</button>
              <button className="small-meeting-submit" type="submit">생성하기</button>
            </div>
          </form>
          <button className="project-group-back" type="button" onClick={() => setIsCreating(false)}>
            <ArrowLeft size={16} aria-hidden="true" /> 목록
          </button>
        </div>
      </div>
    );
  }

  if (selectedGroup) {
    return (
      <div className="project-detail-page">
        <div className="project-detail-content">
          <header className="project-detail-header">
            <h1>{pageTitle} <span aria-hidden="true">|</span> 소모임</h1> 
            <button className="project-detail-more" type="button" aria-label="더 보기"><Ellipsis size={24} /></button>
          </header>
          <section className="project-group-overview" aria-label={`${selectedGroup.title} 상세 정보`}>
            <div className="project-group-topline"> 
              <div className="project-group-name">
                <h2>{selectedGroup.title}</h2>
                <span className={`project-detail-status${selectedGroup.closed ? ' is-closed' : ''}`}>
                  {selectedGroup.closed ? '모집 마감' : '모집 중'}
                </span>
              </div>
              {!selectedGroup.closed && <button className="project-group-join" type="button" onClick={handleJoin}>참여</button>}
            </div>
            <p className="project-group-description">{selectedGroup.description || '등록된 설명이 없습니다.'}</p>
            <p className="project-group-meta">참여 인원 {selectedGroup.members.length}/5 <span aria-hidden="true">·</span> {selectedGroup.start.replaceAll('-', '.')} ~</p>
            <div className="project-group-divider" /> {/*구분선 , aria-hidden="true"는 디자인용. 따라서 읽지 않도록함*/}
            <div className="project-group-members">
              <h3>참여 멤버 ({selectedGroup.members.length}명)</h3>
              <ul>
                {selectedGroup.members.map((member) => (
                  <li key={member.name}> {/*멤버 이름이 각각의 key로 사용됨*/}
                    <span className="project-group-avatar" aria-hidden="true">{member.name[0]}</span> {/*멤버 이름의 첫 글자를 아바타로 표시, name[0] 이기 때문에 "김"표시.*/}
                    <span className="project-group-member-name">{member.name}</span>
                    <span className="project-group-member-role">{member.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          <button className="project-group-back" type="button" onClick={() => setSelectedGroup(null)}>
            <ArrowLeft size={16} aria-hidden="true" /> 목록
          </button>
        </div>
      </div>
    );
  }
 //선택된 소모임이 없을 때, 소모임 목록을 보여줌
  return ( 
    <div className="project-detail-page">
      <div className="project-detail-content">
        <header className="project-detail-header">
          <h1>{pageTitle} <span aria-hidden="true">|</span> 소모임</h1> {/*소모임 페이지 제목*/}
        </header>
        <section aria-label="소모임 목록">
          <div className="project-detail-actions">
            <button type="button" onClick={() => setIsCreating(true)}>
              <Plus size={16} aria-hidden="true" />소모임 만들기
            </button>
          </div>
          <ul className="project-detail-list"> {/*소모임 목록을 ul로 표시*/}
            {groups.map((group) => (
              <ProjectGroupCard key={group.id} group={group} onClick={() => setSelectedGroup(group)} /> //.map() 함수를 사용하여 sampleGroups 배열의 각 소모임을 ProjectGroupCard 컴포넌트로 렌더링, 클릭 시 해당 소모임을 선택
            ))} {/*key={group.id}를 각 카드마다 줌. 그래서 React가 어떤 카드가 변경되었는지 구분 가능*/}
          </ul> {/*group={group} = 그룹 데이터를 부모: SmallMeetingListPage -> 자식: ProjectGroupCard 전달*/}
        </section>
      </div>
    </div>
  );
}
