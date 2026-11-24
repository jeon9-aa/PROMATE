import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { getProjectMembers } from '../../api/TeamPage';
import { removeProjectMember, updateProjectMemberRole } from '../../api/Project/projectApi';
import ProfileAvatar from '../../components/ProfileAvatar/ProfileAvatar';

function MemberRow({ member, onRoleChange, onRemove }) {
  const [role, setRole] = useState(member.role || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const isPending = isSaving || isRemoving;
  const [error, setError] = useState('');
  const pendingRef = useRef(false);
  const hasChanges = role !== (member.role || '');
  const isLeader = member.isLeader === true || member.projectRole === 'LEADER';

  const saveRole = async () => {
    const nextRole = role.trim();
    if (pendingRef.current || !nextRole || !hasChanges) return;
    if (nextRole === (member.role || '')) {
      setRole(nextRole);
      return;
    }
    pendingRef.current = true;
    setIsSaving(true);
    setError('');
    try {
      await onRoleChange(member.memberId, nextRole);
      setRole(nextRole);
    } catch (error) {
      setError(error.response?.data?.message || error.message || '직무 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      pendingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    if (pendingRef.current) return;
    if (!window.confirm(`${member.name} 님을 프로젝트에서 내보내시겠습니까?`)) return;
    pendingRef.current = true;
    setIsRemoving(true);
    setError('');
    try {
      await onRemove(member.memberId);
    } catch (error) {
      setError(error.response?.data?.message || error.message || '멤버 방출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      pendingRef.current = false;
      setIsRemoving(false);
    }
  };

  return (
    <li className="project-settings-member-row">
      <div className="project-settings-member-person">
        <ProfileAvatar src={member.profileImageUrl} alt={`${member.name} 프로필`} size={40} />
        <span className="project-settings-member-name">{member.name}</span>
        {isLeader && <span className="project-settings-member-leader">팀장</span>}
      </div>
      <div className="project-settings-member-actions">
        <div className="project-settings-member-role">
          <input
            className="project-settings-role-input"
            aria-label={`${member.name} 직무`}
            aria-describedby="project-settings-role-help"
            value={role}
            disabled={isPending}
            placeholder="직무 입력"
            title={role || '직무 입력'}
            onChange={(event) => setRole(event.target.value)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing || event.keyCode === 229) return;
              if (event.key === 'Enter') {
                event.preventDefault();
                saveRole();
                event.currentTarget.blur();
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                event.currentTarget.value = member.role || '';
                setRole(member.role || '');
                setError('');
                event.currentTarget.blur();
              }
            }}
          />
          {hasChanges ? (
            <button type="button" className="project-settings-role-save"
              aria-label={`${member.name} 직무 저장`} disabled={isPending || !role.trim()}
              onClick={saveRole}>{isSaving ? '저장 중...' : '저장'}</button>
          ) : <Pencil className="project-settings-role-icon" size={14} aria-hidden="true" />}
        </div>
        <button type="button" className="project-settings-member-remove"
          disabled={isPending}
          aria-label={`${member.name} 내보내기`}
          onClick={handleRemove}>{isRemoving ? '내보내는 중...' : '내보내기'}</button>
      </div>
      {error && <p role="alert">{error}</p>}
    </li>
  );
}

export default function ProjectMembersPanel({ projectId }) {
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [retry, setRetry] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    getProjectMembers(projectId).then((data) => {
      if (cancelled) return;
      if (!Array.isArray(data)) throw new Error('Invalid member response');
      setMembers(data);
      setStatus('ready');
    }).catch(() => {
      if (!cancelled) setStatus('error');
    });
    return () => { cancelled = true; };
  }, [projectId, retry]);

  const changeRole = async (memberId, role) => {
    if (projectId == null || memberId == null) {
      throw new Error('프로젝트 또는 멤버 ID를 확인할 수 없습니다. 멤버 목록의 memberId를 확인해주세요.');
    }
    setMessage('');
    await updateProjectMemberRole(projectId, memberId, role);
    setMembers((current) => current.map((member) => member.memberId === memberId ? { ...member, role } : member));
    setMessage('직무가 저장되었습니다.');
  };

  const removeMember = async (memberId) => {
    if (projectId == null || memberId == null) {
      throw new Error('프로젝트 또는 멤버 ID를 확인할 수 없습니다. 페이지를 새로고침해주세요.');
    }
    setMessage('');
    await removeProjectMember(projectId, memberId);
    setMembers((current) => current.filter((member) => member.memberId !== memberId));
    setMessage('멤버를 성공적으로 방출했습니다.');
  };

  return (
    <section className="project-settings-card project-settings-members" id="project-settings-members" role="tabpanel" aria-labelledby="project-settings-members-tab">
      <h2>프로젝트 멤버 관리</h2>
      <span id="project-settings-role-help" className="project-settings-sr-only">직무를 수정한 뒤 저장 버튼이나 Enter를 누르면 반영합니다. Esc를 누르면 취소합니다. 빈 값은 저장할 수 없습니다.</span>
      {status === 'loading' && <p role="status">멤버를 불러오는 중입니다.</p>}
      {status === 'error' && (
        <div className="project-settings-members-error" role="alert">
          <p>멤버 목록을 불러오지 못했습니다.</p>
          <button type="button" onClick={() => { setStatus('loading'); setRetry((current) => current + 1); }}>다시 시도</button>
        </div>
      )}
      {status === 'ready' && (members.length ? (
        <ul className="project-settings-member-list">
          {members.map((member) => <MemberRow key={member.memberId} member={member} onRoleChange={changeRole} onRemove={removeMember} />)}
        </ul>
      ) : <p>프로젝트 멤버가 없습니다.</p>)}
      <span className="project-settings-sr-only" role="status">{message}</span>
    </section>
  );
}
