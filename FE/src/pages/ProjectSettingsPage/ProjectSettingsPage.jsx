import { useLocation, useParams } from 'react-router-dom';
import MainButton from '../../components/MainButton/MainButton';
import ProjectAvatar from '../../components/ProjectAvatar/ProjectAvatar';
import Tag from '../../components/Tag/Tag';
import useProjectTitle from '../../utils/useProjectTitle';
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
  const { projectId } = useParams();
  const { state } = useLocation();
  const projectTitle = useProjectTitle(projectId, state?.projectTitle);
  const [savedProject, setSavedProject] = useState(null);
  const [draft, setDraft] = useState(null);
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
      <header className="project-settings-header">
        <h1>{title} | 프로젝트 설정</h1>
      </header>

      <div className="project-settings-tabs" role="tablist" aria-label="프로젝트 설정">
        <button type="button" role="tab" id="project-settings-info-tab" aria-selected="true" aria-controls="project-settings-info">정보</button>
        <button type="button" role="tab" aria-selected="false" disabled title="모집 설정은 준비 중입니다">모집</button>
        <button type="button" role="tab" aria-selected="false" disabled title="인원 설정은 준비 중입니다">인원</button>
      </div>

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
          <button type="button" aria-disabled="true" title="프로젝트 종료 기능은 준비 중입니다">프로젝트 종료</button>
          <button type="button" className="project-settings-delete" aria-disabled="true" title="프로젝트 삭제 기능은 준비 중입니다">프로젝트 삭제</button>
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
    </div>
  );
}
import { useState } from 'react';
