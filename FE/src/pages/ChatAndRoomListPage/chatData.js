// 연동 전 더미 데이터
export const initialRooms = [
  ['wap', 'WAP 프로젝트', '이수진', '네 공지 확인했어요!', 0],
  ['capstone', '캡스톤 디자인', '김민준', '내일 회의에서 이야기해요!', 3],
  ['assignment', '팀플 과제', '최서연', '자료 정리해서 보내드릴게요.', 1],
  ['design', '디자인 프로젝트', '정하늘', '수정한 시안 확인 부탁드려요.', 0],
  ['study', 'UX 리서치 스터디', '박지훈', '이번 주 과제 링크 공유드립니다', 2],
].map(([id, projectName, name, text, unread], index) => ({
  id, projectName, name, unread, memberCount: 2,
  avatarUrl: null,
  messages: index === 0 ? [
    { id: 'wap-1', text: '대면 회의 참석 여부 오늘 저녁 6시까지 알려주세요!', sentAt: '2026-11-16T15:52:00+09:00', isMine: false },
    { id: 'wap-2', text: '네 확인했습니다!', sentAt: '2026-11-16T15:52:30+09:00', isMine: true },
    { id: 'wap-3', text: '그리고 팀원 추가 모집 관련해서 확인 부탁드려요~', sentAt: '2026-11-16T15:53:00+09:00', isMine: false },
    { id: 'wap-4', text, sentAt: '2026-11-16T15:53:30+09:00', isMine: true },
  ] : [{ id: `${id}-1`, text, sentAt: `2026-11-${16 - index}T14:30:00+09:00`, isMine: false }],
}));

export function formatMessageTime(value) {
  return new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export function formatMessageDate(value) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  }).format(new Date(value));
}

export function formatRoomTime(value) {
  const date = new Date(value);
  if (date.toDateString() === new Date().toDateString()) return formatMessageTime(value);
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
