import GuardedForm from '../../../components/GuardedForm/GuardedForm.jsx';
import GuardedButton from '../../../components/GuardedButton/GuardedButton.jsx';
import { useState } from "react";
import kakaoLogo from "../../../assets/kakao_logo.svg";

function LoginForm({ onLogin, isLoading }) {
  const [keepLogin, setKeepLogin] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    return onLogin();
  };

  return (
    <GuardedForm className="login-form" onSubmit={handleSubmit}>
      <GuardedButton
        type="submit"
        className="kakao-login-btn"
        disabled={isLoading}
      >
        <span className="kakao-login-content">
          <img src={kakaoLogo} alt="카카오 로고" className="kakao-icon" />

          <span className="kakao-login-text">
            {isLoading ? "이동 중..." : "카카오 로그인으로 시작"}
          </span>
        </span>
      </GuardedButton>
    </GuardedForm>
  );
}

export default LoginForm;
