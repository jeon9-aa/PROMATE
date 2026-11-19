export const CALENDAR_THEMES = [
  { id: 'theme-1', name: '테마 1', colors: ['#e8f8ff', '#e7ffe9', '#f9ffe7', '#fff1e7', '#ffe7e7', '#f9e7ff'] },
  { id: 'theme-2', name: '테마 2', colors: ['#fe766e', '#febec6', '#fef0be', '#fedc98', '#eea3aa', '#f7c7c2'] },
  { id: 'theme-3', name: '테마 3', colors: ['#102F15', '#728C5A', '#EAF1B1', '#EBFADC', '#B9E4E8', '#3F8F88'] },
  { id: 'theme-4', name: '테마 4', colors: ['#505A68', '#566B7F', '#B0757B', '#8D6272', '#6B524D', '#3F2E30'] },
];

export function readThemePreferences(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (CALENDAR_THEMES.some((theme) => theme.id === saved?.themeId) && Number.isInteger(saved.seed)) {
      return { themeId: saved.themeId, seed: saved.seed >>> 0 };
    }
  } catch { /* storage에 접근할 수 없거나 저장된 값이 유효하지 않으면 기본값을 사용 */ }
  return { themeId: 'theme-1', seed: Math.floor(Math.random() * 4294967296) };
}

// 저장한 시드로 다시 렌더링하거나 월을 이동하고 새로고침해도 색상 배정을 유지
// 프로젝트 6개마다 색상 순서를 섞어 여섯 색상을 한 번씩 사용
export function assignProjectColors(projectIds, seed) {
  const ids = [...new Set(projectIds.filter((id) => id != null).map(String))].sort();
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const assignments = new Map();
  let batch = [];
  ids.forEach((id, index) => {
    if (index % 6 === 0) {
      batch = [0, 1, 2, 3, 4, 5];
      for (let i = batch.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [batch[i], batch[j]] = [batch[j], batch[i]];
      }
    }
    assignments.set(id, batch[index % 6]);
  });
  return assignments;
}

export function getEventTextColor(background) {
  const channels = background.slice(1).match(/.{2}/g).map((hex) => {
    const value = parseInt(hex, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? '#000000' : '#ffffff';
}
