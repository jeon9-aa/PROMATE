export const sampleGroups = [
  {
    id: 1,
    title: '프론트엔드 스터디',
    owner: '아무개',
    start: '2026-03-17',
    end: '',
    closed: false,
    members: [
      { userId: 'sample-1-owner', name: '김은비', role: '개설자' },
      { userId: 'sample-1-member', name: '김철수', role: '참여자' },
    ],
  },
  {
    id: 2,
    title: '중간고사 스터디',
    owner: '아무개',
    start: '2026-03-17',
    end: '',
    closed: false,
    members: [
      { userId: 'sample-2-owner', name: '김영희', role: '개설자' },
    ],
  },
  {
    id: 3,
    title: '디자인시스템 스터디',
    owner: '아무개',
    start: '2026-03-17',
    end: '2026-07-23',
    closed: true,
    members: [],
  },
];

const storageKey = 'promate-small-meetings';

export function readSavedGroups() {
  const groups = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!Array.isArray(groups)) throw new Error('Invalid meeting data');
  return groups;
}

export function getProjectGroups(projectId) {
  let saved = [];
  try { saved = readSavedGroups(); } catch { /* Keep sample data available. */ }
  return [...sampleGroups, ...saved.filter((group) => group && String(group.projectId) === String(projectId))];
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
