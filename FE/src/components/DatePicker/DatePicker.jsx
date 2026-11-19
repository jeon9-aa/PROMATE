import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import GuardedButton from '../GuardedButton/GuardedButton.jsx';
import './DatePicker.css';

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

function toDateValue(date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function getDateFromValue(value) {
  return value ? new Date(`${value}T00:00:00`) : new Date();
}

function formatPickerHeader(value) {
  const date = getDateFromValue(value);

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    weekday: weekdays[date.getDay()],
  };
}

export default function DatePicker({ value, min, max, label = '날짜 선택', onChange, onClose }) {
  const [draftDate, setDraftDate] = useState(value || '');
  const [visibleMonth, setVisibleMonth] = useState(() => getDateFromValue(value || min));
  const dialogRef = useRef(null);
  const pickerHeader = formatPickerHeader(draftDate || value);
  useEffect(() => {
    const previousFocus = document.activeElement;
    dialogRef.current.focus();
    return () => previousFocus?.focus();
  }, []);
  const handleKeyDown = (event) => {
    event.stopPropagation();
    if (event.key === 'Escape') onClose();
    if (event.key === 'Tab') {
      const buttons = [...dialogRef.current.querySelectorAll('button:not(:disabled)')];
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };
  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let index = 0; index < firstDay.getDay(); index += 1) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [visibleMonth]);

  const moveMonth = (amount) => {
    setVisibleMonth((currentMonth) => (
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + amount, 1)
    ));
  };

  const selectDay = (date) => {
    setDraftDate(toDateValue(date));
  };

  const clearDate = () => { onChange(''); onClose(); };
  const applyDate = () => { onChange(draftDate); onClose(); };
  return createPortal(
        <div className="date-picker-backdrop" role="presentation" onClick={(event) => { event.stopPropagation(); onClose(); }}>
          <div
            className="date-picker-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            ref={dialogRef}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="date-picker-hero">
              <span>{pickerHeader.year}년</span>
              <strong>
                {pickerHeader.month}월 {pickerHeader.day}일 ({pickerHeader.weekday})
              </strong>
            </div>

            <div className="date-picker-calendar">
              <div className="date-picker-monthbar">
                <GuardedButton type="button" onClick={() => moveMonth(-1)} aria-label="이전 달">
                  ‹
                </GuardedButton>
                <strong>
                  {visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월
                </strong>
                <GuardedButton type="button" onClick={() => moveMonth(1)} aria-label="다음 달">
                  ›
                </GuardedButton>
              </div>

              <div className="date-picker-weekdays" aria-hidden="true">
                {weekdays.map((weekday) => (
                  <span key={weekday}>{weekday}</span>
                ))}
              </div>

              <div className="date-picker-days">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <span key={`empty-${index}`} />;
                  }

                  const value = toDateValue(date);
                  const isSelected = value === draftDate;
                  const isDisabled = (min && value < min) || (max && value > max);

                  return (
                    <GuardedButton
                      key={value}
                      type="button"
                      className={isSelected ? 'date-picker-day date-picker-day--selected' : 'date-picker-day'}
                      onClick={() => selectDay(date)}
                      disabled={isDisabled}
                      aria-label={value}
                      aria-pressed={isSelected}
                    >
                      {date.getDate()}
                    </GuardedButton>
                  );
                })}
              </div>

              <div className="date-picker-actions">
                <GuardedButton type="button" onClick={clearDate}>
                  삭제
                </GuardedButton>
                <GuardedButton type="button" onClick={onClose}>
                  취소
                </GuardedButton>
                <GuardedButton type="button" onClick={applyDate} disabled={!!draftDate && ((!!min && draftDate < min) || (!!max && draftDate > max))}>
                  설정
                </GuardedButton>
              </div>
            </div>
          </div>
        </div>,
    document.body
  );
}
