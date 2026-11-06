import React from "react";
import { Link } from "react-router-dom";
import dashboardIcon from "../../assets/icons/dashboardIcon.svg";
import teamFindIcon from "../../assets/icons/teamFindIcon.svg";
import applicantReviewIcon from "../../assets/icons/applicantReviewIcon.svg";
import projectOrangeIcon from "../../assets/icons/projectOrangeIcon.svg";
import profileIcon from "../../assets/icons/profileIcon.svg";
import "./ChatListPage.css";

const favorites = [
  { name: "캡스톤 디자인", date: "마감일: 2026.03.17", color: "red" },
  { name: "WAP 프로젝트", date: "마감일: 2026.03.31", color: "yellow" },
  { name: "팀플 과제", date: "마감일: 2026.04.01", color: "green" },
];

const conversations = [
  { name: "WAP 프로젝트 · 이지해", preview: "넵 공지 확인했어요!", time: "오후 3:53" },
  { name: "캡스톤 디자인 · 김민준", preview: "다음 주 중간발표 자료 공유드립니다!", time: "오후 2:10", unread: 3 },
  { name: "팀플 과제 · 이수아", preview: "발표 자료 초안 올렸어요, 확인 부탁해요", time: "어제", unread: 5 },
  { name: "ProMate · 홍길동", preview: "지원해주셔서 감사합니다! 편하게 질문 주세요 😊", time: "2026-01-15", unread: 1 },
  { name: "UX 리서치 스터디 · 박지훈", preview: "이번 주 과제 링크 공유드립니다", time: "2025-12-02", unread: 2 },
];

function ChatListPage() {
  return (
    <div className="chat-list-page">
      <header className="chat-topbar">
        <div className="chat-brand">
          <button className="chat-menu-button" type="button" aria-label="메뉴">
            <span /><span /><span />
          </button>
          <Link className="chat-brand-link" to="/">
            <span className="chat-brand-mark" />
            <span className="chat-brand-name">ProMate</span>
          </Link>
          <span className="chat-brand-caption">최고의 팀과 협업하세요.</span>
        </div>
        <div className="chat-user">
          <strong>아무개</strong><span>님 안녕하세요:)</span><span className="chat-user-avatar" />
        </div>
      </header>

      <div className="chat-layout">
        <aside className="chat-sidebar">
          <nav className="chat-nav" aria-label="주 메뉴">
            <Link to="/" className="chat-nav-item"><img className="chat-nav-icon" src={dashboardIcon} alt="" />대시 보드</Link>
            <Link to="/findTeam" className="chat-nav-item"><img className="chat-nav-icon" src={teamFindIcon} alt="" />팀 찾기</Link>
            <Link to="/applicant" className="chat-nav-item"><img className="chat-nav-icon" src={applicantReviewIcon} alt="" />지원자 검토</Link>
            <Link to="/project" className="chat-nav-item active"><img className="chat-nav-icon" src={projectOrangeIcon} alt="" />프로젝트</Link>
            <Link to="/profile" className="chat-nav-item"><img className="chat-nav-icon" src={profileIcon} alt="" />프로필</Link>
          </nav>
          <section className="chat-favorites">
            <h2><span className="favorite-star">★</span>즐겨찾기</h2>
            {favorites.map((item) => (
              <div className="favorite-project" key={item.name}>
                <span className={`favorite-dot ${item.color}`} />
                <div><strong>{item.name}</strong><span>{item.date}</span></div>
              </div>
            ))}
          </section>
          <div className="chat-sidebar-divider" />
          <Link className="chat-new-project" to="/teamCreate"><span>＋</span>새 프로젝트 생성</Link>
        </aside>

        <main className="chat-content">
          <h1>채팅</h1>
          <section className="conversation-panel" aria-label="채팅방 목록">
            <div className="conversation-heading">전체 채팅방 5</div>
            <div className="conversation-list">
              {conversations.map((chat) => (
                <button className="conversation-row" type="button" key={chat.name}>
                  <span className="conversation-avatar" />
                  <span className="conversation-copy">
                    <strong>{chat.name}</strong>
                    <span>{chat.preview}</span>
                  </span>
                  <span className="conversation-meta">
                    <time>{chat.time}</time>
                    {chat.unread && <span className="unread-count">{chat.unread}</span>}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default ChatListPage;
