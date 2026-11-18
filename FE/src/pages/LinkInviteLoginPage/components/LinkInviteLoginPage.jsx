import { useState } from "react";
import { getKakaoLoginUrl } from "../../../api/Auth/kakaoAuthApi.js";
import LoginForm from "../../LoginPage/components/LoginForm.jsx";
import InviteLoginLogo from "./InviteLoginLogo.jsx";
import InviteTeamCard from "./InviteTeamCard.jsx";
import "../LinkInviteLoginPage.css";
import "../LinkInviteLoginForm.css";

function LinkInviteLoginPage({
  teamName = "PRO:MATE",
  inviterName = "아무개",
  teamImageUrl,
  isInviteInvalid = false,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const loginUrl = await getKakaoLoginUrl();
      window.location.href = loginUrl;
    } catch (error) {
      console.error("초대 로그인 URL 요청 실패:", error);
      setError("로그인 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
      setIsLoading(false);
    }
  };

  return (
    <main className="link-invite-login-page">
      <section className="link-invite-login-panel" aria-label="팀 초대 로그인">
        <InviteLoginLogo />
        {isInviteInvalid ? (
          <section className="invite-team-card" role="alert">
            <h1 className="invite-team-name">초대 링크를 열 수 없어요</h1>
            <p className="link-invite-login-error">
              초대한 사람에게 새 링크를 요청해 주세요.
            </p>
          </section>
        ) : (
          <>
            <InviteTeamCard
              teamName={teamName}
              inviterName={inviterName}
              teamImageUrl={teamImageUrl}
            />
            <div className="link-invite-login-actions">
              <LoginForm onLogin={handleLogin} isLoading={isLoading} />
              {error && <p className="link-invite-login-error" role="alert">{error}</p>}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default LinkInviteLoginPage;
