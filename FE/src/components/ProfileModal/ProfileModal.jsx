import GuardedButton from '../GuardedButton/GuardedButton.jsx';
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileModal.css";
import closeIcon from "../../assets/icons/closeIcon.svg";
import ProfileAvatar from "../ProfileAvatar/ProfileAvatar";

function ProfileModal({ isOpen, onClose, user, position }) {
  const [modalPos, setModalPos] = useState({ top: 0, left: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dragPos = useRef({ startX: 0, startY: 0, initialTop: 0, initialLeft: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    if (position) {
      setModalPos({
        top: position.top + 225,
        left: position.left + 100,
      });
    }
  }, [position]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = useCallback((e) => {
    const deltaX = e.clientX - dragPos.current.startX;
    const deltaY = e.clientY - dragPos.current.startY;
    
    setModalPos({
      top: dragPos.current.initialTop + deltaY,
      left: dragPos.current.initialLeft + deltaX,
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (e) => {
    if (isMobile) return;
    if (e.target.closest("button") || e.target.closest(".profile-project-list")) return;

    setIsDragging(true);
    dragPos.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialTop: modalPos.top,
      initialLeft: modalPos.left,
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  const projects = user?.projects ?? [];

  const handleProjectClick = (project) => {
    const recruitmentId = project.recruitmentId ?? project.postId;
    const projectId = project.projectId;
    const hasValidId = (id) => id != null && id !== "" && id !== "null";

    if (hasValidId(recruitmentId)) {
      onClose();
      navigate(`/readme/${recruitmentId}`, { state: project });
      return;
    }

    if (hasValidId(projectId)) {
      onClose();
      navigate(`/project/${projectId}`, {
        state: {
          projectTitle: project.projectTitle || project.title,
          dueDate: project.endDate,
        },
      });
      return;
    }

    alert("해당 프로젝트의 상세 페이지가 없습니다.");
  };

  const popoverStyle = isMobile
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        margin: 0,
      }
    : position
    ? {
        position: "fixed",
        top: `${modalPos.top}px`,
        left: `${modalPos.left}px`,
        transform: "translate(0, -100%)",
        margin: 0,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: isDragging ? "none" : "auto",
      }
    : {};

  return (
    <>
      <div className="profile-popover-backdrop" onClick={onClose} />

      <div 
        className="profile-popover" 
        onClick={(e) => e.stopPropagation()} 
        onMouseDown={handleMouseDown}
        style={popoverStyle}
      >
        <GuardedButton className="profile-close-x-btn" onClick={onClose} aria-label="닫기">
            <img src={closeIcon} alt="닫기 아이콘" />
        </GuardedButton>

        <div className="profile-popover-header">
          <div className="profile-user-info">
            <ProfileAvatar src={user?.profileImage || user?.profileImageUrl} alt="프로필 이미지" />

            <strong className="profile-name">{user?.name || user?.leaderName || "김아무개"}</strong>
          </div>

          <div className="profile-task-count">
            <span className="completed-task">{user?.completedTaskCount ?? 0}</span>
            <span className="total-task">/{user?.totalTaskCount ?? ((user?.completedTaskCount || 0) + (user?.incompleteTaskCount || 0))}</span>
          </div>
        </div>

        <div className="profile-project-section">
          <h3 className="profile-section-title">프로젝트 경험</h3>

          <div className="profile-project-list">
            {projects.map((project, index) => {
              const title = project.title || project.projectTitle || project.projectName;
              const hasValidId = (id) => id != null && id !== "" && id !== "null";
              const isManual = project.isManual ?? ![
                project.projectId, project.recruitmentId, project.postId,
              ].some(hasValidId);
              const period = project.period || (project.startDate && project.endDate ? `${project.startDate} ~ ${project.endDate}` : "");
              
              const rawStatus = project.status || project.projectStatus;
              const isCompleted = rawStatus === "COMPLETED" || rawStatus === "DONE" || rawStatus === "완료";
              const status = isCompleted ? "완료" : "진행중";
              const score = project.score ?? project.averageReviewScore;

              return (
                <div 
                  className="profile-project-item" 
                  key={index}
                  onClick={isManual ? undefined : () => handleProjectClick(project)}
                  style={{ cursor: isManual ? "default" : "pointer" }}
                >
                  <div className="project-main-info">
                    <span className="project-title">
                      {title}
                      {isManual && <span className="profile-project-manual-label">(수동 입력)</span>}
                    </span>
                    <span className="project-period">{period}</span>
                  </div>

                  <div className="project-sub-info">
                    <span
                      className={`project-status ${
                        status === "진행중" ? "active" : "done"
                      }`}
                    >
                      {status}
                    </span>

                    <div className="project-score">
                      {isCompleted && score != null ? (
                        <>
                          <span className="score-number">{Number(score).toFixed(1)}</span>
                          <span className="score-text">점</span>
                        </>
                      ) : (
                        <span className="empty-score"></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileModal;
