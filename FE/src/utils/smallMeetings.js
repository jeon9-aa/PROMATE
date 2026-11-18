const storageKey = 'promate-small-meetings';

export function readSavedGroups() {
  const groups = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!Array.isArray(groups)) throw new Error('Invalid meeting data');
  return groups;
}

export function getProjectGroups(projectId) {
  let saved = [];
  try { saved = readSavedGroups(); } catch { /* Storage unavailable. */ }
  return saved.filter((group) => group && String(group.projectId) === String(projectId));
}

export function saveGroup(group) {
  localStorage.setItem(storageKey, JSON.stringify([...readSavedGroups(), group]));
}

export function getCurrentUserId() {
  let token = '';
  try { token = localStorage.getItem('accessToken') || ''; } catch { /* Storage unavailable. */ }
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return String(payload.userId ?? payload.user_id ?? payload.memberId ?? payload.member_id ?? payload.id ?? payload.sub ?? `token:${token}`);
  } catch {
    return `token:${token || 'anonymous'}`;
  }
}
