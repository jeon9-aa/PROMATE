import DatePicker from '../../../components/DatePicker/DatePicker.jsx';
import GuardedButton from '../../../components/GuardedButton/GuardedButton.jsx';
import { useState } from 'react';

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

function toDateValue(date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function getDateFromValue(value) {
  return value ? new Date(`${value}T00:00:00`) : new Date();
}

function formatDateLabel(value) {
  if (!value) {
    return '날짜 선택';
  }

  const [year, month, day] = value.split('-');
  const date = getDateFromValue(value);
  const weekday = weekdays[date.getDay()];

  return `${year} - ${month} - ${day}\n(${weekday})`;
}

function ProjectPeriodField({ startDate, endDate, onStartDateChange, onEndDateChange }) {
  const [pickerTarget, setPickerTarget] = useState(null);
  const openPicker = setPickerTarget;

  const todayStr = toDateValue(new Date());

  return (
    <div className="form-field project-period-field">
      <span className="teammaking-form-label">프로젝트 기간</span>

      <div className="project-period-row">
        <GuardedButton
          type="button"
          className="period-date-picker"
          onClick={() => openPicker('start')}
          aria-label="프로젝트 시작일 선택"
        >
          <span className="period-date-display">{formatDateLabel(startDate)}</span>
        </GuardedButton>

        <span className="period-separator" aria-hidden="true">
          ~
        </span>

        <GuardedButton
          type="button"
          className="period-date-picker"
          onClick={() => openPicker('end')}
          aria-label="프로젝트 종료일 선택"
        >
          <span className="period-date-display">{formatDateLabel(endDate)}</span>
        </GuardedButton>
      </div>

      {pickerTarget && (
        <DatePicker
          value={pickerTarget === 'start' ? startDate : endDate}
          min={pickerTarget === 'start' ? todayStr : startDate || todayStr}
          label="프로젝트 날짜 선택"
          onChange={pickerTarget === 'start' ? onStartDateChange : onEndDateChange}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  );
}

export default ProjectPeriodField;
