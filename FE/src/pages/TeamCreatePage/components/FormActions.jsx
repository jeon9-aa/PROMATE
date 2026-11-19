import GuardedButton from '../../../components/GuardedButton/GuardedButton.jsx';
function FormActions({ onCancel, onSubmit, isSubmitEnabled }) {
  return (
    <div className="bottom-bar">
      <div className="teammaking-actions">
        <GuardedButton type="button" className="teammaking-btn-cancel" onClick={onCancel}>
          취소
        </GuardedButton>
        <GuardedButton
          type="button"
          className="teammaking-btn-submit"
          onClick={onSubmit}
          disabled={!isSubmitEnabled}
        >
          생성하기
        </GuardedButton>
      </div>
    </div>
  );
}

export default FormActions;
