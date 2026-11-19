import { useRef, useState } from 'react';
import DatePicker from './DatePicker.jsx';

// formData, 필수 입력 검사, 사용자 지정 유효성 검사가 동작하도록 실제 입력 요소 유지
export default function DateInput({ value, defaultValue = '', onChange, min, max, ...props }) {
  const [localValue, setLocalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const currentValue = value ?? localValue;

  const commitDate = (nextValue) => {
    setLocalValue(nextValue);
    inputRef.current.value = nextValue;
    onChange?.({ target: inputRef.current, currentTarget: inputRef.current });
  };

  return (
    <>
      <input
        {...props}
        ref={inputRef}
        type="text"
        inputMode="none"
        autoComplete="off"
        placeholder={props.placeholder || '날짜 선택'}
        aria-label={props['aria-label'] || '날짜 선택'}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        value={currentValue}
        onChange={() => {}}
        onPaste={(event) => event.preventDefault()}
        onClick={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
      />
      {isOpen && (
        <DatePicker
          value={currentValue}
          min={min}
          max={max}
          label={props['aria-label'] || '날짜 선택'}
          onChange={commitDate}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
