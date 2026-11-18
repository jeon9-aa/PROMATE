import { Link, useParams } from "react-router-dom";
import logoImg from "../../assets/logoOrange.svg";
import { useAuthStore } from "../../stores/useAuthStore.js";
import PasswordInviteForm from "./components/PasswordInviteForm.jsx";
import "./PasswordInviteLoginPage.css";

function PasswordInviteLoginPage() {
  const { inviteToken } = useParams();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <main className="password-invite-login-page">
      <section className="password-invite-login-panel" aria-labelledby="password-invite-title">
        <header className="password-invite-logo">
          <img src={logoImg} alt="" width="24" height="24" />
          <span>PRO:MATE</span>
        </header>

        <div className="password-invite-intro">
          <h1 id="password-invite-title">비밀번호</h1>
          <p id="password-invite-description">
            {inviteToken
              ? "팀에서 설정한 숫자 4자리 초대 비밀번호를 입력해 주세요."
              : "팀에서 공유한 초대 링크를 열어 주세요."}
          </p>
        </div>

        {inviteToken && (isLoggedIn ? (
          <PasswordInviteForm key={inviteToken} inviteToken={inviteToken} />
        ) : (
          <Link to="/login" state={{ inviteToken }}>로그인하고 계속하기</Link>
        ))}
      </section>
    </main>
  );
}

export default PasswordInviteLoginPage;
