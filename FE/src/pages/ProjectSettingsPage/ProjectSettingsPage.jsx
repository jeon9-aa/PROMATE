import { useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import GuardedButton from '../../components/GuardedButton/GuardedButton.jsx';
import '../../components/TeamPageMenu/ProjectTitleButton.css';
import MainButton from '../../components/MainButton/MainButton';
import ProjectAvatar from '../../components/ProjectAvatar/ProjectAvatar';
import Tag from '../../components/Tag/Tag';
import TeamPageMenu from '../../components/TeamPageMenu/TeamPageMenu.jsx';
import useProjectTitle from '../../utils/useProjectTitle';
import ProjectMembersPanel from './ProjectMembersPanel';
import './ProjectSettingsPage.css';

const categories = [
  { id: 'PROJECT', label: '조별과제' },
  { id: 'STUDY', label: '스터디' },
  { id: 'CONTEST', label: '공모전' },
  { id: 'DEV', label: '개발' },
  { id: 'ETC', label: '기타' },
];

// 정보 조회 API 연결 전 디자인 확인용 데이터
const previewProject = {
  title: '캡스톤 디자인',
  category: 'PROJECT',
  description: '프로젝트 설명입니다.',
  startDate: '2026-05-02',
  endDate: '2026-05-02',
};

function formatDate(value) {
  if (!value) return '미정';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '미정';
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${value.slice(0, 10).replaceAll('-', ' - ')} (${weekday})`;
}

export default function ProjectSettingsPage() {
  const navigate = useNavigate();
  const deleteOverlayRef = useRef(null);
  const [deleteNotice, setDeleteNotice] = useState('');
  const [confirmationType, setConfirmationType] = useState('delete');
  const isEnding = confirmationType === 'end';
  const confirmationLabel = isEnding ? '종료' : '삭제';

  const openConfirmation = (type) => {
    setConfirmationType(type);
    setDeleteNotice('');
    deleteOverlayRef.current?.showModal();
  };
  const { projectId } = useParams();
  const { state } = useLocation();
  const projectTitle = useProjectTitle(projectId, state?.projectTitle);
  const [savedProject, setSavedProject] = useState(null);
  const [draft, setDraft] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isRecruiting, setIsRecruiting] = useState(true);
  const sourceProject = state?.project || previewProject;
  const project = savedProject || {
    ...sourceProject,
    title: projectTitle || sourceProject.title,
    endDate: state?.dueDate || sourceProject.endDate,
  };
  const isEditing = draft !== null;
  const values = draft || project;
  const hasChanges = isEditing && JSON.stringify(draft) !== JSON.stringify(project);
  const title = project.title;

  const updateDraft = (field, value) => {
    setDraft((current) => current ? { ...current, [field]: value } : current);
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!draft?.title.trim()) return;
    // UI 확인용 저장
    setSavedProject({ ...draft, title: draft.title.trim() });
    setDraft(null);
  };

  return (
    <div className="project-settings-page">
      <dialog ref={deleteOverlayRef} className="project-settings-delete-overlay"
        aria-labelledby="project-settings-delete-title" aria-describedby="project-settings-delete-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) deleteOverlayRef.current?.close();
        }}>
        <div className="project-settings-delete-dialog">
          <h2 id="project-settings-delete-title">프로젝트 {confirmationLabel}</h2>
          <div id="project-settings-delete-description" className="project-settings-delete-description">
            {isEnding ? (
              <p>
                태스크와 회의록 등의 기록은 남지만
                <br />
                <strong>더이상 추가 작성과 수정이 불가</strong>합니다.
              </p>
            ) : <p>
              태스크와 회의록 등의 <strong>이전 기록 모두 삭제</strong>되며
              <br />
              <strong>더이상 추가 작성과 수정도 불가</strong>합니다.
            </p>}
            <p className="project-settings-delete-review">{confirmationLabel} 후 팀원들 간 상호 평가가 시작됩니다.</p>
          </div>
          {deleteNotice && <p className="project-settings-delete-notice" role="status">{deleteNotice}</p>}
          <div className="project-settings-delete-dialog-actions">
            <MainButton className="project-settings-delete-cancel" onClick={() => deleteOverlayRef.current?.close()}>취소</MainButton>
            <MainButton className={isEnding ? 'project-settings-end-confirm' : 'project-settings-delete-confirm'} onClick={() => setDeleteNotice(`프로젝트 ${confirmationLabel} 기능은 준비 중입니다.`)}>{confirmationLabel}</MainButton>
          </div>
        </div>
      </dialog>
      <header className="project-settings-header">
        <h1>
          <GuardedButton type="button" className="project-title-button" data-tooltip="팀페이지로 이동"
            onClick={() => navigate(`/project/${projectId}`, { state: { projectTitle: title, dueDate: project.endDate } })}>
            {title} | 프로젝트 설정
          </GuardedButton>
        </h1>
        <TeamPageMenu projectId={projectId} projectTitle={title} dueDate={project.endDate} currentPage="settings" />
      </header>

      <div className="project-settings-tabs" role="tablist" aria-label="프로젝트 설정"
        onKeyDown={(event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const tabs = ['info', 'recruitment', 'members'];
          const direction = event.key === 'ArrowLeft' ? -1 : 1;
          const nextTab = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[2] : tabs[(tabs.indexOf(activeTab) + direction + tabs.length) % tabs.length];
          setActiveTab(nextTab);
          document.getElementById(`project-settings-${nextTab}-tab`)?.focus();
        }}>
        <button type="button" role="tab" id="project-settings-info-tab" aria-selected={activeTab === 'info'} tabIndex={activeTab === 'info' ? 0 : -1} aria-controls="project-settings-info" onClick={() => setActiveTab('info')}>정보</button>
        <button type="button" role="tab" id="project-settings-recruitment-tab" aria-selected={activeTab === 'recruitment'} tabIndex={activeTab === 'recruitment' ? 0 : -1} aria-controls="project-settings-recruitment" onClick={() => setActiveTab('recruitment')}>모집</button>
        <button type="button" role="tab" id="project-settings-members-tab" aria-selected={activeTab === 'members'} tabIndex={activeTab === 'members' ? 0 : -1} aria-controls="project-settings-members" onClick={() => setActiveTab('members')}>멤버</button>
      </div>

      {activeTab === 'info' ? (
      <form className={`project-settings-card${isEditing ? ' is-editing' : ''}`} id="project-settings-info" role="tabpanel" aria-labelledby="project-settings-info-tab" onSubmit={handleSave}>
        <h2>프로젝트 정보 관리</h2>
        <div className="project-settings-fields">
          <div className="project-settings-identity">
            <div className="project-settings-image">
              <ProjectAvatar
                src={values.imageUrl}
                size="80px"
                onImageChange={isEditing ? (imageUrl) => updateDraft('imageUrl', imageUrl) : undefined}
              />
              {isEditing && <span className="project-settings-image-add" aria-hidden="true">+</span>}
            </div>
            <div className="project-settings-field project-settings-name">
              <label htmlFor="project-settings-name">프로젝트 이름</label>
              <input id="project-settings-name" value={values.title} readOnly={!isEditing} required pattern=".*\S.*" onChange={(event) => updateDraft('title', event.target.value)} />
            </div>
          </div>

          <div className="project-settings-field">
            <h3 id="project-settings-domain-label">도메인 설정</h3>
            <div className="project-settings-domains" role="group" aria-labelledby="project-settings-domain-label">
              {categories.map(({ id, label }) => (
                isEditing ? (
                  <button key={id} type="button" className="project-settings-domain-option" aria-pressed={values.category === id} onClick={() => updateDraft('category', id)}>
                    <Tag isActive={values.category === id}>{label}</Tag>
                  </button>
                ) : (
                  <Tag key={id} isActive={values.category === id}>
                    {label}{values.category === id && <span className="project-settings-sr-only"> (선택됨)</span>}
                  </Tag>
                )
              ))}
            </div>
          </div>

          <div className="project-settings-field project-settings-description">
            <label htmlFor="project-settings-description">프로젝트 설명</label>
            <textarea id="project-settings-description" value={values.description || ''} readOnly={!isEditing} onChange={(event) => updateDraft('description', event.target.value)} />
          </div>

          <div className="project-settings-field">
            <h3 id="project-settings-period-label">프로젝트 기간</h3>
            <div className="project-settings-period" role="group" aria-labelledby="project-settings-period-label">
              {isEditing ? (
                <input type="date" aria-label="프로젝트 시작일" required value={values.startDate?.slice(0, 10) || ''} max={values.endDate?.slice(0, 10)} onChange={(event) => updateDraft('startDate', event.target.value)} />
              ) : <time dateTime={project.startDate}>{formatDate(project.startDate)}</time>}
              <span>~</span>
              {isEditing ? (
                <input type="date" aria-label="프로젝트 종료일" required value={values.endDate?.slice(0, 10) || ''} min={values.startDate?.slice(0, 10)} onChange={(event) => updateDraft('endDate', event.target.value)} />
              ) : <time dateTime={project.endDate}>{formatDate(project.endDate)}</time>}
            </div>
          </div>
        </div>

        <hr />
        <div className="project-settings-management">
          <button type="button" className="project-settings-end" onClick={() => openConfirmation('end')}>프로젝트 종료</button>
          <button type="button" className="project-settings-delete" onClick={() => openConfirmation('delete')}>프로젝트 삭제</button>
        </div>
        <div className="project-settings-actions">
          {isEditing ? (
            <>
              {hasChanges && <p className="project-settings-unsaved" role="status">저장하지 않은 변경 사항이 있습니다.</p>}
              <MainButton className="project-settings-edit project-settings-cancel" onClick={() => setDraft(null)}>취소</MainButton>
              <MainButton className="project-settings-edit" type="submit">저장하기</MainButton>
            </>
          ) : (
            <MainButton className="project-settings-edit" onClick={() => setDraft({ ...project })}>수정하기</MainButton>
          )}
        </div>
      </form>
      ) : activeTab === 'recruitment' ? (
        <section className="project-settings-card project-settings-recruitment" id="project-settings-recruitment" role="tabpanel" aria-labelledby="project-settings-recruitment-tab">
          <h2>프로젝트 모집 관리</h2>
          <div className="project-settings-recruitment-row">
            <div className="project-settings-recruitment-copy">
              <span id="project-settings-recruitment-label">신규 모집 여부</span>
              <p id="project-settings-recruitment-description">
                {isRecruiting ? '프로젝트가 공개되고 신규 지원 접수를 받습니다.' : '신규 지원 접수를 받지 않습니다.'}
              </p>
            </div>
            <button
              type="button"
              className="project-settings-switch"
              role="switch"
              aria-checked={isRecruiting}
              aria-labelledby="project-settings-recruitment-label"
              aria-describedby="project-settings-recruitment-description"
              onClick={() => setIsRecruiting((current) => !current)}
            >
              <span className="project-settings-switch-handle" />
            </button>
          </div>
        </section>
      ) : null}
      <div hidden={activeTab !== 'members'}>
        <ProjectMembersPanel key={projectId} projectId={projectId} />
      </div>
    </div>
  );
}
