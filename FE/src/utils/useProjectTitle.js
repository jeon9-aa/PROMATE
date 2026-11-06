import { useEffect, useState } from 'react';
import { getProjectTasks } from '../api/TeamPage';

export default function useProjectTitle(projectId, suppliedTitle) {
  const cacheKey = `promate-project-title:${projectId || 'default'}`;
  const [loaded, setLoaded] = useState(null);
  let cached = '';
  try { cached = sessionStorage.getItem(cacheKey) || ''; } catch { /* Storage unavailable. */ }
  const title = suppliedTitle || cached || (loaded?.id === projectId ? loaded.title : '');
  useEffect(() => {
    if (suppliedTitle) {
      try { sessionStorage.setItem(cacheKey, suppliedTitle); } catch { /* Storage unavailable. */ }
    }
    if (!projectId || title) return;
    let cancelled = false;
    getProjectTasks(Number(projectId)).then((data) => {
      if (cancelled || !data?.projectTitle) return;
      setLoaded({ id: projectId, title: data.projectTitle });
      try { sessionStorage.setItem(cacheKey, data.projectTitle); } catch { /* Storage unavailable. */ }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [projectId, suppliedTitle, cacheKey, title]);
  return title;
}
