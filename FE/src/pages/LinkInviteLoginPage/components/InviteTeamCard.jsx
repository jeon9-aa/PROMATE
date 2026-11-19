function InviteTeamCard({ teamName, inviterName, teamImageUrl }) {
  return (
    <section className="invite-team-card" aria-labelledby="invite-team-name">
      <div className="invite-team-avatar" aria-hidden="true">
        {teamImageUrl && <img src={teamImageUrl} alt="" />}
      </div>
      <h1 id="invite-team-name" className="invite-team-name">{teamName}</h1>
      <p className="invite-team-description">
        {inviterName}님이 {teamName} 팀에 초대했습니다
      </p>
    </section>
  );
}

export default InviteTeamCard;
