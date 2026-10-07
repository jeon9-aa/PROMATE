const formatDate = (date) => date.replaceAll('-', '.');

export default function ProjectGroupCard({ group }) {
  return (
    <li className="project-detail-group">
      <div className="project-detail-group-info">
        <h2>{group.title}</h2>
        <p>
          <span>{group.owner}</span>
          <span className="project-detail-period">
            <time dateTime={group.start}>{formatDate(group.start)}</time>~
            {group.end && <time dateTime={group.end}>{formatDate(group.end)}</time>}
          </span>
        </p>
      </div>
      <span className={`project-detail-status${group.closed ? ' is-closed' : ''}`}>
        {group.closed ? '마감' : '모집중'}
      </span>
    </li>
  );
}