import { useState } from "react";
import projectLogo from "../../assets/icons/logoGW.svg";
import "./PasswordInvitePage.css";

function PasswordInvitePage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!password.trim()) return;

    alert("비밀번호 등록 기능은 서버 API 연결 후 사용할 수 있습니다.");
  };

  return (
    <div className="link-invite-page password-invite-page">
      <div className="link-invite-content">
        <div className="link-invite-banner" aria-hidden="true">
          <img className="link-invite-banner-logo" src={projectLogo} alt="" />
        </div>
        <main className="link-invite-project-content">
          <section className="link-invite-project-info">
            <div className="link-invite-title-row">
              <h1 className="link-invite-title">ProMate</h1>
              <span className="link-invite-share-trigger"><span aria-hidden="true">↗</span> 링크 공유</span>
              <button
                type="button"
                className="link-invite-share-trigger"
                onClick={() => setIsModalOpen(true)}
              >
                <svg
                  className="link-invite-lock-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="4" y="10" width="16" height="11" rx="1.5" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                비밀번호 초대
              </button>
            </div>
            <div className="link-invite-tags" aria-label="프로젝트 분야">
              <span className="active">개발</span><i />
              <span>WEB</span><span>협업툴</span><span>프로젝트</span>
            </div>
            <p className="link-invite-summary">
              ProMate는 팀 프로젝트의 협업 툴로서 다양한 직무분야의 사람들이 모여 프로젝트를 관리하고 팀원 모집과 프로젝트 지원을 할 수 있는 플랫폼입니다.
            </p>
          </section>

          <div className="link-invite-preview-images" aria-label="프로젝트 이미지"><div /><div /></div>
          <div className="link-invite-divider" aria-hidden="true" />

          <section className="link-invite-team-section">
            <h2>팀장</h2>
            <div className="link-invite-member">
              <span className="link-invite-member-name">홍길동</span>
              <span className="link-invite-member-role">PM</span>
            </div>
          </section>

          <section className="link-invite-team-section link-invite-team-members">
            <h2>팀원</h2>
            <div className="link-invite-member-list">
              {[
                { name: "김영희", role: "FE" },
                { name: "김철수", role: "UIUX" },
                { name: "김영희", role: "BE" },
                { name: "김영희", role: "FE" },
              ].map((member, index) => (
                <div className="link-invite-member" key={`${member.role}-${index}`}>
                  <span className="link-invite-member-name">{member.name}</span>
                  <span className="link-invite-member-role">{member.role}</span>
                </div>
              ))}
            </div>
          </section>
          <div className="link-invite-apply-wrap">
            <button className="link-invite-apply-button" type="button">지원하기</button>
          </div>
        </main>
      </div>

      {isModalOpen && <div className="password-invite-overlay">
        <section
          className="password-invite-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-invite-title"
          aria-describedby="password-invite-description"
        >
          <h1 id="password-invite-title">비밀번호 공유</h1>
          <p id="password-invite-description">
            이 비밀번호로 입장한 참여자는 지원자 검색 없이 바로 프로젝트에 참여합니다.
          </p>

          <div className="password-invite-expiry">
            <span className="password-invite-clock" aria-hidden="true">◷</span>
            <span>비밀번호 유효기간: 설정 후 24시간</span>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="invite-password">비밀번호 설정</label>
            <input
              id="invite-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="초대에 사용할 비밀번호를 설정해 주세요."
              autoComplete="new-password"
              required
            />

            <div className="password-invite-actions">
              <button
                type="button"
                className="password-invite-cancel"
                onClick={() => setIsModalOpen(false)}
              >
                취소
              </button>
              <button type="submit" className="password-invite-submit" disabled={!password.trim()}>
                비밀번호 등록
              </button>
            </div>
          </form>
        </section>
      </div>}
    </div>
  );
}

export default PasswordInvitePage;
