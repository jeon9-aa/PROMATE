import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CALENDAR_THEMES, assignProjectColors, getEventTextColor } from './calendarThemes';
import './CalendarThemeModal.css';

export default function CalendarThemeModal({ themeId, projects, onClose, onApply }) {
  const [selectedId, setSelectedId] = useState(themeId);
  const [previewSeed, setPreviewSeed] = useState(() => Math.floor(Math.random() * 4294967296));
  const dialogRef = useRef(null);
  const selectedTheme = CALENDAR_THEMES.find((theme) => theme.id === selectedId);
  const previewColors = assignProjectColors(projects.map((project) => project.id), previewSeed);
  const previewProjects = projects.map((project) => ({
    ...project,
    id: `project:${project.id}`,
    title: project.title || `프로젝트 ${project.id}`,
    colorIndex: previewColors.get(String(project.id)),
  }));
  const usedColors = new Set(previewColors.values());
  const sampleColors = assignProjectColors([0, 1, 2, 3, 4, 5], previewSeed);
  for (const colorIndex of sampleColors.values()) {
    if (previewProjects.length >= 6) break;
    if (usedColors.has(colorIndex)) continue;
    previewProjects.push({
      id: `sample:${colorIndex}`,
      title: `예시 ${previewProjects.length - projects.length + 1}`,
      colorIndex,
    });
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <dialog ref={dialogRef} className="calendar-theme-modal" aria-labelledby="calendar-theme-title"
      aria-describedby="calendar-theme-description" onCancel={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="calendar-theme-content">
        <h2 id="calendar-theme-title">캘린더 테마 설정</h2>
        <p id="calendar-theme-description">프로젝트별 일정을 구분할 색상 테마를 선택해주세요.</p>
        <fieldset className="calendar-theme-options">
          <legend>색상 테마</legend>
          {CALENDAR_THEMES.map((theme) => (
            <label key={theme.id} className={`calendar-theme-option ${selectedId === theme.id ? 'is-selected' : ''}`}>
              <span className="calendar-theme-option-title">
                <input type="radio" name="calendar-theme" value={theme.id} checked={selectedId === theme.id}
                  onChange={() => {
                    setSelectedId(theme.id);
                    setPreviewSeed(Math.floor(Math.random() * 4294967296));
                  }} />
                <span>{theme.name}</span>
                {theme.id === 'theme-1' && <small>기본</small>}
              </span>
              <span className="calendar-theme-swatches" aria-hidden="true">
                {theme.colors.map((color) => <span key={color} style={{ backgroundColor: color }} />)}
              </span>
            </label>
          ))}
        </fieldset>
        <div className="calendar-theme-preview">
          <h3>프로젝트 색상 미리보기{projects.length === 0 ? ' (예시)' : ''}</h3>
          <div>
            {previewProjects.map((project) => {
              const color = selectedTheme.colors[project.colorIndex];
              const title = project.title;
              return <span key={project.id} title={title} style={{ backgroundColor: color, color: getEventTextColor(color) }}>{title}</span>;
            })}
          </div>
        </div>
        <p className="calendar-theme-hint">테마 적용할 때마다 프로젝트별 색상이 랜덤으로 다시 배정됩니다.</p>
        <div className="calendar-theme-actions">
          <button type="button" onClick={onClose}>취소</button>
          <button type="button" onClick={() => onApply(selectedId, previewSeed)}>적용</button>
        </div>
      </div>
    </dialog>, document.body,
  );
}
