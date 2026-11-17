import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function PasswordInviteForm({ expectedPassword }) {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState(["", "", "", ""]);
  const [feedback, setFeedback] = useState(null);
  const inputs = useRef([]);

  const handleChange = (index, value) => {
    const character = value.slice(-1);
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
    const pasted = Array.from(event.clipboardData.getData("text").trim()).slice(0, 4 - index);
    if (!pasted.length) return;
    setCharacters((previous) => previous.map((item, position) => (
      position >= index && position < index + pasted.length ? pasted[position - index] : item
    )));
    setFeedback(null);
    inputs.current[Math.min(index + pasted.length, 3)]?.focus();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const emptyIndex = characters.findIndex((character) => !character);
    if (emptyIndex !== -1) {
      setFeedback({ isError: true, message: "비밀번호 네 자리를 모두 입력해주세요." });
      inputs.current[emptyIndex]?.focus();
      return;
    }
    const isCorrect = characters.join("") === expectedPassword;
    if (isCorrect) {
      navigate("/login");
      return;
    }
    setFeedback({
      isError: true,
      message: "비밀번호가 일치하지 않습니다. 다시 입력해주세요.",
    });
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
            maxLength={1}
            value={character}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onPaste={(event) => handlePaste(event, index)}
            onFocus={(event) => event.target.select()}
          />
        ))}
      </div>
      <button className="password-invite-submit" type="submit">입장하기</button>
      {feedback && (
        <p
          id="password-invite-feedback"
          className={`password-invite-feedback${feedback.isError ? " is-error" : ""}`}
          role={feedback.isError ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      )}
    </form>
  );
}

export default PasswordInviteForm;
