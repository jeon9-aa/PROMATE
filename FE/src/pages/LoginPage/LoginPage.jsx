import { useState } from "react";
import { useLocation } from "react-router-dom";
import "./LoginPage.css";
import LoginLogo from "./components/LoginLogo";
import LoginForm from "./components/LoginForm";
import { getKakaoLoginUrl } from "../../api/Auth/kakaoAuthApi.js";

function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useLocation();

  const kakaoHandleLogin = async () => {
    setIsLoading(true);

    try {
      const backendUrl = await getKakaoLoginUrl();
      if (state?.returnTo) {
        sessionStorage.setItem("pendingLoginReturnTo", state.returnTo);
      } else {
        sessionStorage.removeItem("pendingLoginReturnTo");
      }
      if (state?.inviteToken) {
        sessionStorage.setItem("pendingProjectInviteToken", state.inviteToken);
      } else {
        sessionStorage.removeItem("pendingProjectInviteToken");
      }
      window.location.href = backendUrl;
    } catch (error) {
      console.error("로그인 URL 요청 실패:", error);
      alert("로그인 서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <LoginLogo />
        <LoginForm onLogin={kakaoHandleLogin} isLoading={isLoading} />
      </section>
    </main>
  );
}

export default LoginPage;
