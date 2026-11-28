export const mockProject = {
  projectId: 1,
  title: '프로메이트',
};

export const mockMembers = [
  { userId: 1, name: '쿠정아', role: '프론트엔드', isLeader: true },
  { userId: 2, name: '서령배', role: '프론트엔드', isLeader: false },
  { userId: 3, name: '초이하진', role: '백엔드', isLeader: false },
  { userId: 4, name: '빽진선', role: '백엔드', isLeader: false },
  { userId: 5, name: '이찬삼', role: 'PM', isLeader: false },
  { userId: 6, name: '갓은서', role: '디자이너', isLeader: false },
];

export const mockTasks = [
  {
    taskId: 1,
    title: '팀 페이지 반응형 UI 구현',
    managerId: 1,
    managerName: '쿠정아',
    role: '프론트엔드',
    description: '태블릿과 모바일에서도 카드 레이아웃이 자연스럽게 보이도록 수정합니다.',
    dueDate: '2026-09-05',
    status: 'IN_PROGRESS',
  },
  {
    taskId: 2,
    title: '프로젝트 API 연동',
    managerId: 2,
    managerName: '초이하진',
    role: '백엔드',
    description: '프로젝트 상세 조회 API와 예외 응답을 정리합니다.',
    dueDate: '2026-09-08',
    status: 'TODO',
  },
  {
    taskId: 3,
    title: '컴포넌트 디자인 검수',
    managerId: 3,
    managerName: '빽진선',
    role: '디자이너',
    description: '디자인 시스템과 간격, 색상, 폰트 크기를 비교합니다.',
    dueDate: '2026-09-03',
    status: 'DONE',
  },
  {
    taskId: 4,
    title: '중간 발표 자료 준비',
    managerId: 4,
    managerName: '이찬삼',
    role: 'PM',
    description: '현재 진행 상황과 다음 스프린트 계획을 발표 자료로 정리합니다.',
    dueDate: '2026-09-12',
    status: 'TODO',
  },
  {
    taskId: 5,
    title: '접근성 점검',
    managerId: 1,
    managerName: '쿠정아',
    role: '프론트엔드',
    description: '키보드 탐색과 스크린 리더 레이블을 점검합니다.',
    dueDate: '2026-09-15',
    status: 'IN_PROGRESS',
  },
];

export const mockPosts = [
  {
    postId: 1,
    title: '9월 첫째 주 회의 안내ㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅇ',
    content: '목요일 오후 8시에 온라인으로 진행합니다. 진행 상황을 미리 정리해주세요.',
    writerName: '이찬삼',
    postType: 'GENERAL',
    createdAt: '2026-09-02T10:30:00',
  },
  {
    postId: 2,
    title: '디자인 시안 업데이트',
    content: '팀 페이지 카드와 모달 시안을 업데이트했습니다. 확인 후 의견을 남겨주세요.',
    writerName: '빽진선',
    postType: 'GENERAL',
    createdAt: '2026-09-01T15:10:00',
  },
  {
    postId: 3,
    title: 'API 명세 변경사항',
    content: '태스크 상태 변경 응답에 projectProgress 필드가 추가되었습니다.',
    writerName: '초이하진',
    postType: 'GENERAL',
    createdAt: '2026-08-30T09:00:00',
  },
  {
    postId: 4,
    title: '이번 주 개발 목표',
    content: '팀 페이지 UI 개발과 주요 사용자 흐름 검증을 완료하는 것이 목표입니다.',
    writerName: '쿠정아',
    postType: 'GENERAL',
    createdAt: '2026-08-28T18:20:00',
  },
  {
    postId: 5,
    title: '프로젝트 일정 공유',
    content: '9월 2일부터 9월 25일까지 QA 기간을 포함한 전체 일정을 공유합니다.',
    writerName: '이찬삼',
    postType: 'GENERAL',
    createdAt: '2026-08-27T14:45:00',
  },
  {
    postId: 6,
    title: '팀 페이지 반응형 UI 구현 완료',
    content: '모바일과 태블릿에서도 카드 레이아웃이 자연스럽게 보이도록 수정했습니다.',
    writerName: '쿠정아',
    postType: 'GENERAL',
    createdAt: '2026-09-05T11:15:00',
  }
];

export const mockSchedules = [
  {
    scheduleId: 1,
    projectId: 1,
    projectTitle: mockProject.title,
    title: '팀 페이지 UI 개발',
    content: '팀 페이지 레이아웃과 반응형 스타일을 작업합니다.',
    startDate: '2026-09-02',
    endDate: '2026-09-05',
  },
  {
    scheduleId: 2,
    projectId: 1,
    projectTitle: mockProject.title,
    title: '중간 점검 회의',
    content: '완료된 기능을 시연하고 다음 작업을 정합니다.',
    startDate: '2026-09-10',
    endDate: '2026-09-10',
  },
  {
    scheduleId: 3,
    projectId: 1,
    projectTitle: mockProject.title,
    title: 'QA 기간',
    content: '주요 기능과 모바일 화면을 함께 테스트합니다.',
    startDate: '2026-09-21',
    endDate: '2026-09-25',
  },
];
