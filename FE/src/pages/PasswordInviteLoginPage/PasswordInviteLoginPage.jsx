import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProjectInvite } from "../../api/Project/projectInviteApi.js";
import { formatInviteExpiry } from "../ProjectReadMePage/formatInviteExpiry.js";
import { getSecureImageUrl } from "../../utils/imageUrl.js";
import logoImg from "../../assets/logoOrange.svg";
import { useAuthStore } from "../../stores/useAuthStore.js";
import PasswordInviteForm from "./components/PasswordInviteForm.jsx";
import "./PasswordInviteLoginPage.css";

function PasswordInviteLoginPage() {
  const { inviteToken } = useParams();
  return <InvitePageContent key={inviteToken || "missing"} inviteToken={inviteToken} />;
}

function InvitePageContent({ inviteToken }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [invitation, setInvitation] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(inviteToken));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!inviteToken) return;
    const controller = new AbortController();
    getProjectInvite(inviteToken, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setInvitation(data);
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError.response?.data?.message || requestError.message || "초대 정보를 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [inviteToken]);

  return (
    <main className="password-invite-login-page">
      <section className="password-invite-login-panel" aria-labelledby="password-invite-title">
        <header className="password-invite-logo">
          <img src={logoImg} alt="" width="22" height="22" />
          <span>PRO:MATE</span>
        </header>

        <div className="password-invite-intro">
          {invitation?.thumbnailUrl && (
            <img className="password-invite-thumbnail"
              src={getSecureImageUrl(invitation.thumbnailUrl)} alt={`${invitation.projectTitle} 썸네일`}
              onError={(event) => { event.currentTarget.hidden = true; }} />
          )}
          <h1 id="password-invite-title">{invitation?.projectTitle || "프로젝트 초대"}</h1>
          <p id="password-invite-description">
            {!inviteToken
              ? "팀에서 공유한 초대 링크를 열어 주세요."
              : isLoggedIn
                ? <>팀에서 설정한 비밀번호를 입력해주세요.</>
                : <>프로젝트에 참여하려면 먼저 로그인해주세요.<br />로그인 후 초대 비밀번호를 입력할 수 있어요.</>}
          </p>
        </div>

        {isLoading && <p className="password-invite-feedback" role="status">초대 정보를 불러오는 중…</p>}
        {error && <p className="password-invite-feedback is-error" role="alert">{error}</p>}
        {invitation && (isLoggedIn ? (
          <PasswordInviteForm key={inviteToken} inviteToken={inviteToken} />
        ) : (
          <Link className="password-invite-submit" to="/login" state={{ inviteToken }}>로그인하고 계속하기</Link>
        ))}
        {invitation && (
          <div className="password-invite-project">
            <p>유효시간: <time dateTime={invitation.expiresAt}>{formatInviteExpiry(invitation.expiresAt)}</time>까지 (한국 시간)</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default PasswordInviteLoginPage;
