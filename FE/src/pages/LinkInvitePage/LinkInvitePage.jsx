import { useState } from 'react';
import projectLogo from '../../assets/icons/logoGW.svg';
import './LinkInvitePage.css';

const inviteUrl = 'promate.app/p/ab3xk9';

const members = [
  { name: '김영희', role: 'FE' },
  { name: '김철수', role: 'UIUX' },
  { name: '김영희', role: 'BE' },
  { name: '김영희', role: 'FE' },
];

function LinkInvitePage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${inviteUrl}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access may be unavailable outside a secure browser context.
      setCopied(false);
    }
  };

  return (
    <div className="link-invite-page">
      <div className="link-invite-content">
        <div className="link-invite-banner" aria-hidden="true">
          <img className="link-invite-banner-logo" src={projectLogo} alt="" />
        </div>
        <main className="link-invite-project-content">
          <section className="link-invite-project-info">
            <div className="link-invite-title-row">
              <h1 className="link-invite-title">ProMate</h1>
              <button className="link-invite-share-trigger" onClick={() => setIsModalOpen(true)}>
                <span aria-hidden="true">↗</span> 링크 공유
              </button>
              <button className="link-invite-share-trigger" onClick={() => setIsModalOpen(true)}>
                <span aria-hidden="true">▣</span> 비밀번호 초대
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

          <div className="link-invite-preview-images" aria-label="프로젝트 이미지">
            <div /><div />
          </div>

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
              {members.map((member, index) => (
                <div className="link-invite-member" key={`${member.role}-${index}`}>
                  <span className="link-invite-member-name">{member.name}</span>
                  <span className="link-invite-member-role">{member.role}</span>
                </div>
              ))}
            </div>
          </section>
          <div className="link-invite-apply-wrap">
            <button className="link-invite-apply-button">지원하기</button>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="link-invite-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsModalOpen(false);
        }}>
          <section className="link-invite-modal" role="dialog" aria-modal="true" aria-labelledby="link-invite-modal-title">
            <button className="link-invite-close" aria-label="닫기" onClick={() => setIsModalOpen(false)}>×</button>
            <h2 id="link-invite-modal-title">링크 공유</h2>
            <p className="link-invite-description">
              해당 링크로 입장한 참가자는 지원자 검토 후 참여할 수 있습니다.
            </p>
            <div className="link-invite-link-field">
              <label htmlFor="invite-link">공유 링크</label>
              <div className="link-invite-link-row">
                <div className="link-invite-url" id="invite-link">{inviteUrl}</div>
                <button className="link-invite-copy-button" onClick={copyInviteLink}>
                  {copied ? '복사됨' : '복사'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default LinkInvitePage;
