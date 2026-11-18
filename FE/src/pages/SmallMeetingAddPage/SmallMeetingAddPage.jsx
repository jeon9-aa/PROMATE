import GuardedForm from '../../components/GuardedForm/GuardedForm.jsx';
import GuardedButton from '../../components/GuardedButton/GuardedButton.jsx';
import { useState } from 'react';
import apiClient from '../../api/apiClient';
import { getCurrentUserId, saveGroup } from '../../utils/smallMeetings';
import useProjectTitle from '../../utils/useProjectTitle';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './SmallMeetingAddPage.css';

export default function SmallMeetingAddPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const projectTitle = useProjectTitle(projectId, state?.projectTitle);
  const [saveError, setSaveError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const listPath = `/project/${projectId}/smallMeetingList`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setSaveError('');
    const form = event.currentTarget;
    const formData = new FormData(form);
    const start = formData.get('startDate');
    const end = formData.get('endDate');
    const endDateInput = form.elements.endDate;

    endDateInput.setCustomValidity('');
    if (end < start) {
      endDateInput.setCustomValidity('종료일은 시작일 이후로 선택해 주세요.');
      endDateInput.reportValidity();
      return;
    }

    const newGroup = {
      projectId: String(projectId),
      title: formData.get('title').trim(),
      description: formData.get('description').trim(),
      owner: '나',
      capacity: Number(formData.get('capacity')),
      start,
      end,
      closed: false,
      members: [{ userId: getCurrentUserId(), name: '나', role: '개설자' }],
    };

    setIsSubmitting(true);
    let response;
    try {
      response = await apiClient.post(`/projects/${encodeURIComponent(projectId)}/subgroups`, {
        name: newGroup.title,
        year: Number(start.split('-')[0]),
      });
    } catch {
      setSaveError('소모임을 생성하지 못했습니다. 다시 시도해 주세요.');
      setIsSubmitting(false);
      return;
    }

    const id = (response.data?.result ?? response.data)?.id;
    if (id != null) {
      try {
        saveGroup({ ...newGroup, id });
      } catch {
        // 서버에서 생성한 소모임은 로컬 저장소 오류와 관계없이 유지된다.
      }
    }

    navigate(listPath, { state: { projectTitle } });
  };

  return (
    <div className="small-meeting-add-page">
      <div className="small-meeting-add-content">
        <header className="small-meeting-add-header">
          <h1>{projectTitle} <span aria-hidden="true">|</span> 소모임</h1>
          <GuardedButton className="small-meeting-add-more" type="button" aria-label="더 보기">···</GuardedButton>
        </header>

        <GuardedForm className="small-meeting-add-card" onSubmit={handleSubmit}>
          <div className="small-meeting-add-fields">
            <label className="small-meeting-add-field small-meeting-add-field-name">
              <span>소모임 이름</span>
              <input name="title" placeholder="소모임 이름을 적어주세요." required />
            </label>

            <label className="small-meeting-add-field small-meeting-add-field-description">
              <span>소모임 설명</span>
              <textarea name="description" placeholder="소모임에 대한 설명을 적어 주세요." />
            </label>

            <div className="small-meeting-add-options">
              <label className="small-meeting-add-field small-meeting-add-capacity">
                <span>모집 인원</span>
                <select name="capacity" defaultValue="5">
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                    <option key={count} value={count}>{count}명</option>
                  ))}
                </select>
              </label>

              <fieldset className="small-meeting-add-field small-meeting-add-period">
                <legend>소모임 기간</legend>
                <div className="small-meeting-add-date-range">
                  <input aria-label="시작일" name="startDate" type="date" onChange={(event) => event.currentTarget.form.elements.endDate.setCustomValidity('')} required />
                  <span aria-hidden="true">~</span>
                  <input aria-label="종료일" name="endDate" type="date" onChange={(event) => event.currentTarget.setCustomValidity('')} required />
                </div>
              </fieldset>
            </div>
          </div>

          {saveError && <p role="alert">{saveError}</p>}
          <div className="small-meeting-add-actions">
            <GuardedButton className="small-meeting-add-cancel" type="button" onClick={() => navigate(listPath, { state: { projectTitle } })}>취소</GuardedButton>
            <GuardedButton className="small-meeting-add-submit" type="submit" disabled={isSubmitting}>생성하기</GuardedButton>
          </div>
        </GuardedForm>

        <GuardedButton className="small-meeting-add-back" type="button" onClick={() => navigate(listPath, { state: { projectTitle } })}>
          <ArrowLeft size={16} aria-hidden="true" /> 목록
        </GuardedButton>
      </div>
    </div>
  );
}