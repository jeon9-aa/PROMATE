export async function findProjectRecruitment(projectId, { getPage, getDetail }) {
  const visited = new Set();
  for (let page = 0; ; page += 1) {
    const payload = await getPage(page);
    const items = Array.isArray(payload) ? payload : payload?.content;
    if (!Array.isArray(items)) throw new Error('모집글 목록을 불러오지 못했습니다.');
    let checked = 0;
    for (const item of items) {
      const id = item.recruitmentId ?? item.postId;
      if (id == null || visited.has(String(id))) continue;
      visited.add(String(id));
      checked += 1;
      if (item.projectId != null && String(item.projectId) !== String(projectId)) continue;
      let detail;
      try {
        detail = await getDetail(id);
      } catch (error) {
        if (error.response?.status === 404) continue;
        throw error;
      }
      if (detail?.projectId != null && String(detail.projectId) === String(projectId)) {
        return { ...detail, recruitmentId: id };
      }
    }
    if (Array.isArray(payload) || items.length === 0 || checked === 0 || payload.last === true ||
        (Number.isInteger(payload.totalPages) && page + 1 >= payload.totalPages) ||
        (payload.last == null && payload.totalPages == null)) break;
  }
  throw new Error('이 프로젝트에 연결된 모집글을 찾지 못했습니다.');
}
