import GuardedForm from '../GuardedForm/GuardedForm.jsx';
import GuardedButton from '../GuardedButton/GuardedButton.jsx';
import { useEffect, useState, useRef } from "react";
import "./ApplyModal.css";
import { getApplicationForm, postApplication, getMyApplication, updateMyApplication, cancelMyApplication, resolveMyApplicationId } from "../../api/Recruits/recruitmentApi";

function ApplyModal({
  isOpen,
  onClose,
  onSubmit,
  projectName,
  recruitmentId,
  job,
  motivation,
  setJob,
  setMotivation,
  isApplied = false,
  applicationId,
  onCancel,
}) {
  const [fetchedTitle, setFetchedTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [resolvedApplicationId, setResolvedApplicationId] = useState(null);
  const submitLockRef = useRef(false);
  const savedApplicationRef = useRef({ job: "", motivation: "" });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    let active = true;

    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsLoading(true);
      setLoadError("");
      setFetchedTitle("");
      setIsEditing(false);
      setResolvedApplicationId(null);

      if (recruitmentId) {
        const fetchApplyData = async () => {
          try {
            const targetApplicationId = isApplied
              ? await resolveMyApplicationId(recruitmentId, applicationId)
              : null;
            if (!active) return;
            const response = await (isApplied ? getMyApplication(recruitmentId, targetApplicationId) : getApplicationForm(recruitmentId));
            if (!active) return;
            const isSuccess = response?.data?.isSuccess ?? response?.isSuccess;
            if (isSuccess) {
              const data = response?.data?.data ?? response?.data;
              setFetchedTitle(data?.recruitmentTitle);
              if (isApplied) {
                setResolvedApplicationId(targetApplicationId);
                const saved = {
                  job: data?.objective ?? "",
                  motivation: data?.prContent ?? data?.introduction ?? "",
                };
                savedApplicationRef.current = saved;
                setJob(saved.job);
                setMotivation(saved.motivation);
              }
            } else {
              throw new Error(response?.message || "지원서를 불러오지 못했습니다.");
            }
          } catch (error) {
            console.error("지원서 작성용 데이터 로드 실패:", error);
            if (active) setLoadError(error.message || "지원서를 불러오지 못했습니다.");
          } finally {
            if (active) setIsLoading(false);
          }
        };
        fetchApplyData();
      }
    }

    return () => {
      active = false;
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, recruitmentId, applicationId, isApplied, setJob, setMotivation]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLockRef.current || isLoading || loadError || (isApplied && !isEditing)) return;

    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      const applicationData = {
        objective: job,
        prContent: motivation
      };

      const response = await (isApplied
        ? updateMyApplication(recruitmentId, resolvedApplicationId, applicationData)
        : postApplication(recruitmentId, applicationData));
      
      const isSuccess = response?.data?.isSuccess ?? response?.isSuccess;
      if (isSuccess) {
        alert(isApplied ? "지원서가 수정되었습니다." : "지원이 완료되었습니다.");
        onSubmit?.(response?.data?.data ?? response?.data);
        onClose?.();
      } else {
        const errorMsg = response?.data?.message ?? response?.message ?? "지원 처리 중 문제가 발생했습니다.";
        alert(errorMsg);
      }
    } catch (error) {
      console.error("지원서 제출 실패:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "지원서 제출 중 오류가 발생했습니다.";
      alert(errorMessage);
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (submitLockRef.current || isLoading || loadError) return;
    if (!window.confirm("지원을 취소하시겠습니까?")) return;
    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      const response = await cancelMyApplication(recruitmentId, resolvedApplicationId);
      if (!response?.isSuccess) throw new Error(response?.message || "지원 취소에 실패했습니다.");
      alert("지원이 취소되었습니다.");
      onCancel?.();
      onClose?.();
    } catch (error) {
      alert(error.message || "지원 취소에 실패했습니다.");
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (submitLockRef.current) return;
    setJob(savedApplicationRef.current.job);
    setMotivation(savedApplicationRef.current.motivation);
    setIsEditing(false);
  };

  const handleOverlayClick = (e) => {
    if (!submitLockRef.current && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div className="apply-modal-overlay" onClick={handleOverlayClick}>
      <div className="apply-modal" role="dialog" aria-modal="true" aria-label={isApplied ? "내 지원서" : "지원서 작성"}>
        <button type="button" className="apply-modal-close-btn" onClick={onClose} disabled={isSubmitting} aria-label="닫기">×</button>
        <h2 className="apply-modal-title">{fetchedTitle || projectName}</h2>
        {isLoading && <p role="status">지원서를 불러오는 중입니다...</p>}
        {loadError && <p role="alert">{loadError}</p>}

        <GuardedForm className="apply-modal-form" onSubmit={handleSubmit}>
          <div className="apply-modal-group">
            <label htmlFor="apply-job" className="apply-modal-label">
              기여하고 싶은 분야 (선택)
            </label>
            <input
              id="apply-job"
              type="text"
              className="apply-modal-input"
              value={job}
              readOnly={isApplied && !isEditing}
              disabled={isLoading || !!loadError || isSubmitting}
              onChange={(e) => setJob(e.target.value)}
              maxLength={50}
              placeholder="기여하고 싶은 분야를 적어주세요."
            />
          </div>

          <div className="apply-modal-group">
            <label
              htmlFor="apply-motivation"
              className="apply-modal-label"
            >
              지원 동기 및 자기 PR
            </label>
            <textarea
              id="apply-motivation"
              className="apply-modal-textarea"
              value={motivation}
              readOnly={isApplied && !isEditing}
              disabled={isLoading || !!loadError || isSubmitting}
              onChange={(e) => setMotivation(e.target.value)}
              required
              maxLength={500}
              placeholder="지원 동기 및 자기 PR을 적어주세요."
            />
          </div>

          <div className="apply-modal-button-wrap">
            <GuardedButton
              type="button"
              className="apply-modal-cancel-btn"
              onClick={isApplied ? (isEditing ? handleCancelEdit : handleCancel) : onClose}
              disabled={isSubmitting || (isApplied && (isLoading || !!loadError))}
            >
              {isApplied && !isEditing ? "지원 취소" : "취소"}
            </GuardedButton>
            {isApplied && !isEditing ? (
              <GuardedButton
                key="edit"
                type="button"
                className="apply-modal-submit-btn"
                onClick={() => setIsEditing(true)}
                disabled={isSubmitting || isLoading || !!loadError}
              >
                지원서 수정
              </GuardedButton>
            ) : (
              <GuardedButton
                key="submit"
                type="submit"
                className="apply-modal-submit-btn"
                disabled={isSubmitting || isLoading || !!loadError}
              >
                {isSubmitting ? "처리 중..." : isApplied ? "완료" : "지원하기"}
              </GuardedButton>
            )}
          </div>
        </GuardedForm>
      </div>
    </div>
  );
}

export default ApplyModal;
