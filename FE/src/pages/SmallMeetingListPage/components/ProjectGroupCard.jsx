const formatDate = (date) => date.replaceAll('-', '.');

export default function ProjectGroupCard({ group, onClick }) {
  return (
    <li className="project-detail-group">
      <button className="project-detail-group-button" type="button" onClick={onClick}>
        <span className="project-detail-group-info">
          <span className="project-detail-group-title">{group.title}</span>
          <span className="project-detail-group-meta">
            <span>{group.owner}</span>
            <span className="project-detail-period"><time dateTime={group.start}>{formatDate(group.start)}</time> ~ {group.end && <time dateTime={group.end}>{formatDate(group.end)}</time>}</span>
          </span>
        </span>
        <span className={`project-detail-status${group.closed ? ' is-closed' : ''}`}>{group.closed ? '마감' : '모집 중'}</span>
      </button>
    </li>
  );
}
