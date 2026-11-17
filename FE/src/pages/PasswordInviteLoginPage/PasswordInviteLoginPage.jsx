import logoImg from "../../assets/logoOrange.svg";
import PasswordInviteForm from "./components/PasswordInviteForm.jsx";
import { passwordInviteData } from "./passwordInviteData.js";
import "./PasswordInviteLoginPage.css";

function PasswordInviteLoginPage() {
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
            {passwordInviteData.teamName} 팀에서 설정한<br />
            비밀번호를 입력해주세요.
          </p>
        </div>

        <PasswordInviteForm expectedPassword={passwordInviteData.password} />
      </section>
    </main>
  );
}

export default PasswordInviteLoginPage;
