import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getProjectSettings, updateProject, updateProjectStatus, updateRecruitmentStatus } from '../../api/Project/projectApi';
import GuardedButton from '../../components/GuardedButton/GuardedButton.jsx';
import DateInput from '../../components/DatePicker/DateInput.jsx';
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
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const statusRequestRef = useRef(false);
  const [confirmationType, setConfirmationType] = useState('delete');
  const isEnding = confirmationType === 'end';
  const confirmationLabel = isEnding ? '종료' : '삭제';

  const openConfirmation = (type) => {
    setConfirmationType(type);
    setDeleteNotice('');
    deleteOverlayRef.current?.showModal();
  };
  const { projectId } = useParams();
  const location = useLocation();
  const { state } = location;
  const projectTitle = useProjectTitle(projectId, state?.projectTitle);
  const [savedProject, setSavedProject] = useState(null);
  const [loadedProject, setLoadedProject] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    getProjectSettings(projectId).then((data) => {
      if (!cancelled) {
        setLoadedProject({ id: projectId, data });
        setLoadError('');
      }
    }).catch((error) => {
      if (!cancelled) setLoadError(error.message || '프로젝트 정보를 불러오지 못했습니다.');
    });
    return () => { cancelled = true; };
  }, [projectId, loadAttempt]);
  const isLoaded = loadedProject?.id === projectId;
  const [draft, setDraft] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const [saveError, setSaveError] = useState('');
  const [saveNotice, setSaveNotice] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [isUpdatingRecruitment, setIsUpdatingRecruitment] = useState(false);
  const recruitmentPendingRef = useRef(false);
  const [recruitmentError, setRecruitmentError] = useState('');
  const sourceProject = isLoaded ? loadedProject.data : {};
  const project = savedProject || {
    ...sourceProject,
    description: sourceProject.content ?? sourceProject.description ?? '',
    thumbnail: sourceProject.thumbnail ?? sourceProject.recruitImageUrl ?? sourceProject.imageUrl ?? null,
    title: sourceProject.title || projectTitle || '',
    startDate: sourceProject.startDate?.slice(0, 10).replaceAll('.', '-'),
    endDate: sourceProject.endDate?.slice(0, 10).replaceAll('.', '-'),
  };
  const isEditing = draft !== null;
  const values = draft || project;
  const hasChanges = isEditing && JSON.stringify(draft) !== JSON.stringify(project);
  const title = project.title;
  const isCompleted = project.status === 'COMPLETED';
  const isRecruiting = project.recruitmentStatus === 'RECRUITING';

  const toggleRecruitment = async () => {
    if (recruitmentPendingRef.current || !isLoaded || isCompleted || isSaving || isChangingStatus) return;
    if (project.recruitmentId == null) {
      setRecruitmentError('연결된 모집글을 확인할 수 없습니다.');
      return;
    }
    const recruitmentStatus = isRecruiting ? 'COMPLETED' : 'RECRUITING';
    recruitmentPendingRef.current = true;
    setIsUpdatingRecruitment(true);
    setRecruitmentError('');
    try {
      await updateRecruitmentStatus(project.recruitmentId, recruitmentStatus);
      setSavedProject({ ...project, recruitmentStatus });
      setDraft((current) => current ? { ...current, recruitmentStatus } : current);
    } catch (error) {
      const message = error.response?.data?.message || error.message || '모집 상태 변경에 실패했습니다.';
      if (message === '해당 게시글의 수정/삭제 권한이 없습니다.') {
        window.alert('신규 모집 설정은 팀장만 변경가능합니다');
      } else {
        setRecruitmentError(message);
      }
    } finally {
      recruitmentPendingRef.current = false;
      setIsUpdatingRecruitment(false);
    }
  };

  const handleConfirmation = async () => {
    if (!isEnding) {
      setDeleteNotice('프로젝트 삭제 기능은 준비 중입니다.');
      return;
    }
    if (statusRequestRef.current || savingRef.current || recruitmentPendingRef.current || isCompleted) return;
    if (!projectId) {
      setDeleteNotice('프로젝트 ID를 확인할 수 없습니다.');
      return;
    }
    statusRequestRef.current = true;
    setIsChangingStatus(true);
    setDeleteNotice('');
    try {
      await updateProjectStatus(projectId, 'COMPLETED');
      const updatedProject = { ...project, status: 'COMPLETED' };
      setSavedProject(updatedProject);
      setDraft(null);
      setSaveError('');
      setSaveNotice('프로젝트가 종료되었습니다.');
      navigate(`${location.pathname}${location.search}${location.hash}`, {
        replace: true,
        state: { ...state, project: updatedProject },
      });
      deleteOverlayRef.current?.close();
    } catch (error) {
      setDeleteNotice(error.response?.data?.message || error.message || '프로젝트 종료에 실패했습니다. 다시 시도해주세요.');
    } finally {
      statusRequestRef.current = false;
      setIsChangingStatus(false);
    }
  };

  const updateDraft = (field, value) => {
    if (savingRef.current) return;
    setDraft((current) => current ? { ...current, [field]: value } : current);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!isLoaded || savingRef.current || statusRequestRef.current || recruitmentPendingRef.current || isCompleted || !projectId || !draft?.title.trim()) return;
    const totalSlots = Number(draft.totalSlots);
    if (draft.totalSlots == null || String(draft.totalSlots).trim() === '' || !Number.isSafeInteger(totalSlots) || totalSlots < 0) {
      setSaveError('모집 인원을 0 이상의 정수로 입력해주세요.');
      return;
    }
    const payload = {
      title: draft.title.trim(),
      category: draft.category,
      description: draft.description || '',
      startDate: draft.startDate?.slice(0, 10),
      endDate: draft.endDate?.slice(0, 10),
      thumbnailUrl: draft.thumbnail ?? null,
      totalSlots,
    };
    if (!payload.startDate || !payload.endDate || payload.startDate > payload.endDate) {
      setSaveError('프로젝트 시작일과 종료일을 확인해주세요.');
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    setSaveError('');
    setSaveNotice('');
    try {
      await updateProject(projectId, payload);
      const updatedProject = {
        ...draft, ...payload,
        thumbnail: payload.thumbnailUrl,
      };
      setSavedProject(updatedProject);
      setDraft(null);
      try { sessionStorage.setItem(`promate-project-title:${projectId}`, payload.title); } catch { /* Storage unavailable. */ }
      navigate(`${location.pathname}${location.search}${location.hash}`, {
        replace: true,
        state: { ...state, project: updatedProject, projectTitle: payload.title, dueDate: payload.endDate },
      });
      window.alert('프로젝트 정보가 저장되었습니다.');
    } catch (error) {
      setSaveError(error.response?.data?.message || error.message || '프로젝트 정보 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <div className="project-settings-page">
      <dialog ref={deleteOverlayRef} className="project-settings-delete-overlay"
        onCancel={(event) => { if (statusRequestRef.current) event.preventDefault(); }}
        aria-labelledby="project-settings-delete-title" aria-describedby="project-settings-delete-description"
        onClick={(event) => {
          if (event.target === event.currentTarget && !statusRequestRef.current) deleteOverlayRef.current?.close();
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
            <MainButton className="project-settings-delete-cancel" disabled={isChangingStatus} onClick={() => deleteOverlayRef.current?.close()}>취소</MainButton>
            <MainButton className={isEnding ? 'project-settings-end-confirm' : 'project-settings-delete-confirm'} disabled={isChangingStatus} onClick={handleConfirmation}>{isChangingStatus ? '종료 중...' : confirmationLabel}</MainButton>
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
        <div className="project-settings-info-toolbar">
          <h2>프로젝트 정보 관리</h2>
          <div className="project-settings-actions">
            {isEditing ? (
              <>
                {hasChanges && <p className="project-settings-unsaved" role="status">저장하지 않은 변경 사항이 있습니다.</p>}
                <MainButton className="project-settings-edit project-settings-cancel" disabled={isSaving} onClick={() => { setDraft(null); setSaveError(''); }}>취소</MainButton>
                <MainButton className="project-settings-edit" type="submit" disabled={isSaving}>{isSaving ? '저장 중...' : '저장하기'}</MainButton>
              </>
            ) : (
              <MainButton className="project-settings-edit" disabled={!isLoaded || isChangingStatus || isCompleted} onClick={() => { setDraft({ ...project }); setSaveError(''); setSaveNotice(''); }}>수정하기</MainButton>
            )}
          </div>
        </div>
        {!isLoaded && (loadError ? <div role="alert"><p>{loadError}</p><button type="button" onClick={() => { setLoadError(''); setLoadAttempt((value) => value + 1); }}>다시 시도</button></div> : <p role="status">프로젝트 정보를 불러오는 중입니다.</p>)}
        <div className="project-settings-fields">
          <div className="project-settings-identity">
            <div className="project-settings-image">
              <ProjectAvatar
                src={values.thumbnail}
                size="70px"
                onImageChange={isEditing && !isSaving ? (thumbnail) => updateDraft('thumbnail', thumbnail) : undefined}
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

          <div className="project-settings-field project-settings-total-slots">
            <label htmlFor="project-settings-total-slots">모집 인원</label>
            <input
              id="project-settings-total-slots"
              type="number"
              min="0"
              step="1"
              required
              value={values.totalSlots ?? ''}
              placeholder="모집 인원 입력"
              readOnly={!isEditing || isSaving}
              onChange={(event) => updateDraft('totalSlots', event.target.value)}
            />
          </div>

          <div className="project-settings-field project-settings-description">
            <label htmlFor="project-settings-description">프로젝트 설명</label>
            <textarea id="project-settings-description" value={values.description || ''} readOnly={!isEditing} onChange={(event) => updateDraft('description', event.target.value)} />
          </div>

          <div className="project-settings-field">
            <h3 id="project-settings-period-label">프로젝트 기간</h3>
            <div className="project-settings-period" role="group" aria-labelledby="project-settings-period-label">
              {isEditing ? (
                <DateInput aria-label="프로젝트 시작일" required disabled={isSaving} value={values.startDate?.slice(0, 10) || ''} max={values.endDate?.slice(0, 10)} onChange={(event) => updateDraft('startDate', event.target.value)} />
              ) : <time dateTime={project.startDate}>{formatDate(project.startDate)}</time>}
              <span>~</span>
              {isEditing ? (
                <DateInput aria-label="프로젝트 종료일" required disabled={isSaving} value={values.endDate?.slice(0, 10) || ''} min={values.startDate?.slice(0, 10)} onChange={(event) => updateDraft('endDate', event.target.value)} />
              ) : <time dateTime={project.endDate}>{formatDate(project.endDate)}</time>}
            </div>
          </div>
        </div>

        {saveError && <p role="alert">{saveError}</p>}
        {saveNotice && <p role="status">{saveNotice}</p>}
        <hr />
        <div className="project-settings-footer">
          <div className="project-settings-management">
            <button type="button" className="project-settings-end" disabled={isSaving || isChangingStatus || isEditing || isCompleted} onClick={() => openConfirmation('end')}>{isCompleted ? '종료된 프로젝트' : '프로젝트 종료'}</button>
            <button type="button" className="project-settings-delete" onClick={() => openConfirmation('delete')}>프로젝트 삭제</button>
          </div>

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
              disabled={!isLoaded || isUpdatingRecruitment || isSaving || isChangingStatus || isCompleted}
              aria-busy={isUpdatingRecruitment}
              onClick={toggleRecruitment}
            >
              <span className="project-settings-switch-handle" />
            </button>
          </div>
          {!isLoaded && <p role="status">{loadError || '모집 상태를 불러오는 중입니다.'}</p>}
          {isUpdatingRecruitment && <p role="status">모집 상태를 변경하는 중입니다.</p>}
          {recruitmentError && <p role="alert">{recruitmentError}</p>}
        </section>
      ) : null}
      <div hidden={activeTab !== 'members'}>
        <ProjectMembersPanel key={projectId} projectId={projectId} />
      </div>
    </div>
  );
}
