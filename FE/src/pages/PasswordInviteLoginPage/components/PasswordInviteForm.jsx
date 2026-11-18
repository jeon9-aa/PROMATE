import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinProjectByInvite } from "../../../api/Project/projectInviteApi.js";

function PasswordInviteForm({ inviteToken }) {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState(["", "", "", ""]);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const character = value;
    setCharacters((previous) => previous.map((item, position) => (
      position === index ? character : item
    )));
    setFeedback(null);
    if (character && index < 3) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !characters[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 3) {
      event.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event, index) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").trim();
    if (!/^[0-9]{1,4}$/.test(pasted)) return;
    const start = pasted.length === 4 ? 0 : index;
    if (start + pasted.length > characters.length) return;
    setCharacters((previous) => previous.map((item, position) => (
      position >= start && position < start + pasted.length ? pasted[position - start] : item
    )));
    setFeedback(null);
    inputs.current[Math.min(start + pasted.length, 3)]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const emptyIndex = characters.findIndex((character) => !character);
    if (emptyIndex !== -1) {
      setFeedback({ isError: true, message: "비밀번호 숫자 4자리를 모두 입력해 주세요." });
      inputs.current[emptyIndex]?.focus();
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const { projectId } = await joinProjectByInvite(inviteToken, characters.join(""));
      navigate(`/project/${projectId}`, { replace: true });
    } catch (error) {
      const { code, message } = error.response?.data ?? {};
      setFeedback({
        isError: code === "INVITE_E004",
        message: message || "초대 참여 요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="password-invite-form" onSubmit={handleSubmit} noValidate>
      <div className="password-invite-inputs" role="group" aria-label="네 자리 초대 비밀번호" aria-describedby="password-invite-description">
        {characters.map((character, index) => (
          <input
            key={index}
            ref={(element) => { inputs.current[index] = element; }}
            type="password"
            name={`invite-password-${index + 1}`}
            aria-label={`비밀번호 ${index + 1}번째 자리`}
            aria-invalid={feedback?.isError || false}
            aria-describedby={feedback ? "password-invite-feedback" : undefined}
            autoComplete="off"
            inputMode="numeric"
            maxLength={1}
            disabled={isSubmitting}
            value={character}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onPaste={(event) => handlePaste(event, index)}
            onFocus={(event) => event.target.select()}
          />
        ))}
      </div>
      <button className="password-invite-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "확인 중…" : "입장하기"}
      </button>
      {feedback && (
        <p
          id="password-invite-feedback"
          className={`password-invite-feedback${feedback.isError ? " is-error" : ""}`}
          role="alert"
        >
          {feedback.message}
        </p>
      )}
    </form>
  );
}

export default PasswordInviteForm;
