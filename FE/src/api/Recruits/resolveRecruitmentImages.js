export async function resolveRecruitmentImages(recruitments, getDetail) {
  return Promise.all(recruitments.map(async (recruitment) => {
    const id = recruitment.recruitmentId || recruitment.id || recruitment.postId;
    if (recruitment.recruitImageUrl || id == null) return recruitment;

    try {
      const detail = await getDetail(id);
      return { ...recruitment, recruitImageUrl: detail?.recruitImageUrl ?? null };
    } catch {
      return recruitment;
    }
  }));
}
