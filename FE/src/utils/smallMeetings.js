import { useEffect, useState } from 'react';

const storageKey = 'promate-small-meetings';

export function useSmallMeetingClock() {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener('focus', refresh);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return now;
}

export function isSmallMeetingClosed(subgroup, now) {
  if (!subgroup) return false;
  const { status, currentCount, capacity, endDate } = subgroup;
  const isFull = currentCount != null && capacity != null && Number(currentCount) >= Number(capacity);
  if (status === 'COMPLETED' || isFull) return true;
  if (!endDate) return false;

  if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    const endOfRecruitment = new Date(`${endDate}T00:00:00`);
    endOfRecruitment.setDate(endOfRecruitment.getDate() + 1);
    return now >= endOfRecruitment.getTime();
  }

  return now >= Date.parse(endDate);
}

export function readSavedGroups() {
  const groups = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!Array.isArray(groups)) throw new Error('Invalid meeting data');
  return groups;
}

export function getProjectGroups(projectId, createdGroup) {
  let saved = [];
  try { saved = readSavedGroups(); } catch { /* Storage unavailable. */ }
  const projectGroups = saved.filter((group) => group && String(group.projectId) === String(projectId));
  if (createdGroup && String(createdGroup.projectId) === String(projectId) &&
      !projectGroups.some((group) => String(group.id) === String(createdGroup.id))) {
    projectGroups.push(createdGroup);
  }
  return projectGroups;
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
