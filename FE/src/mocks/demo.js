import { http, HttpResponse } from 'msw';
import recruitImage from '../assets/logoIcon.svg';
import { mockMembers, mockPosts, mockProject, mockSchedules, mockTasks } from './data.js';

// Local calendar dates keep the demo useful on any presentation day.
export function demoDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const projects = [
  { ...mockProject, recruitImageUrl: recruitImage, description: '팀 매칭부터 일정과 태스크 관리까지 함께하는 협업 서비스', startDate: demoDate(-21), endDate: demoDate(21) },
];
mockTasks.forEach((task, index) => {
  task.projectId = 1;
  task.dueDate = demoDate(task.status === 'DONE' ? -2 : index + 1);
});
mockPosts.forEach((post, index) => {
  post.createdAt = `${demoDate(-index)}T10:30:00`;
});
mockPosts[0].title = '이번 주 스프린트 회의 안내';
mockPosts[4].content = '이번 스프린트의 개발, 코드 리뷰, QA 일정을 공유합니다. 캘린더를 확인해주세요.';
mockSchedules.forEach((schedule, index) => {
  schedule.startDate = demoDate(index * 3);
  schedule.endDate = demoDate(index * 3 + (index === 1 ? 0 : 2));
});

const user = { userId: 1, name: mockMembers[0].name, nickname: mockMembers[0].name, profileImageUrl: null };
const categories = ['PROJECT', 'STUDY', 'CONTEST', 'DEV', 'ETC'];
const titles = ['캠퍼스 생활 도우미', '함께하는 알고리즘 스터디', '친환경 아이디어 공모전', '동네 맛집 지도 개발', '주말 독서 모임'];
const recruitments = Array.from({ length: 15 }, (_, index) => ({
  recruitmentId: index + 1,
  recruitImageUrl: index % 2 === 0 ? recruitImage : null,
  title: `${titles[index % 5]} ${Math.floor(index / 5) + 1}기`,
  description: '작은 목표부터 함께 완성할 팀원을 모집합니다. 매주 진행 상황을 공유하고 결과물을 만들어갑니다.',
  content: '함께 배우며 결과물을 완성할 팀원을 찾습니다.\n\n매주 한 번 온라인으로 만나 진행 상황을 공유합니다. 기획, 디자인, 개발 중 관심 있는 분야로 참여해주세요.\n\n최종 발표와 회고까지 함께할 분을 기다립니다.',
  category: categories[index % 5], status: 'RECRUITING',
  maxMember: 5, totalSlots: 5, currentMember: 2,
  startDate: demoDate(7), endDate: demoDate(60), deadline: demoDate(6),
  createdAt: `${demoDate(-index)}T09:00:00`,
  isBookmarked: index < 4, myApplyStatus: index === 1 ? 'PENDING' : null,
  myApplicationId: index === 1 ? 101 : null,
  hasApplied: index === 1, isAuthor: index === 14,
  author: { nickname: index === 14 ? user.name : '김민서' },
}));
const applications = ['PENDING', 'PENDING', 'ACCEPTED', 'REJECTED'].map((status, index) => ({
  applicationId: index + 1, recruitmentId: 15, status,
  name: ['김민서', '박지훈', '이서연', '최도윤'][index],
  completedTasks: 8 + index, totalTasks: 12 + index,
  appliedAt: `${demoDate(-index - 1)}T14:00:00`,
  introduction: 'React와 API 연동 경험을 살려 사용하기 편한 서비스를 만들고 싶습니다. 매주 회의와 코드 리뷰에 꾸준히 참여하겠습니다.',
  pastProjects: [],
}));
const histories = [{ historyId: 1, projectName: '캠퍼스 해커톤', startDate: demoDate(-90), endDate: demoDate(-60), status: 'COMPLETED', editable: true }];
const ok = (data) => HttpResponse.json({ isSuccess: true, message: '요청에 성공했습니다.', data });
applications.push({ applicationId: 101, recruitmentId: 2, status: 'PENDING', objective: '프론트엔드 개발', prContent: 'React 개발 경험으로 프로젝트에 기여하고 싶습니다.' });
const missing = () => HttpResponse.json({ isSuccess: false, message: '데이터를 찾을 수 없습니다.', data: null }, { status: 404 });
const projectStats = () => projects.map((project) => ({
  ...project,
  completedTaskCount: mockTasks.filter((task) => task.status === 'DONE').length,
  incompleteTaskCount: mockTasks.filter((task) => task.status !== 'DONE').length,
  totalTaskCount: mockTasks.length,
}));
const dashboardTasks = (completed) => mockTasks
  .filter((task) => completed ? task.status === 'DONE' : task.status !== 'DONE' && task.dueDate <= demoDate(7))
  .map((task) => ({ ...task, projectTitle: mockProject.title, taskStatus: task.status }));
const page = (items, request) => {
  const query = new URL(request.url).searchParams;
  const size = Math.max(1, Number(query.get('size')) || 10);
  const number = Math.max(0, Number(query.get('page')) || 0);
  return { content: items.slice(number * size, (number + 1) * size), totalElements: items.length, totalPages: Math.ceil(items.length / size), number, size };
};
const findRecruitment = (params) => recruitments.find((item) => item.recruitmentId === Number(params.recruitmentId));

export const demoHandlers = [
  http.get('*/user/me', () => ok(user)),
  http.patch('*/user/me', async ({ request }) => {
    const body = await request.json();
    if (body.name) user.name = body.name;
    if (body.profileImageBase64) user.profileImageUrl = body.profileImageBase64;
    return ok(user);
  }),
  http.get('*/user/me/projects/task-counts', () => ok(projectStats())),
  http.get('*/user/me/projectHistories', () => ok(histories)),
  http.get('*/projects/me', () => ok(projectStats())),
  http.get('*/projects/activity/me', () => ok([])),
  http.get('*/dashboard/projects/me', () => ok(projectStats())),
  http.get('*/dashboard/projects/status', () => ok(projectStats())),
  http.get('*/dashboard/tasks/deadline', () => ok(dashboardTasks(false))),
  http.get('*/dashboard/tasks/completed', () => ok(dashboardTasks(true))),
  http.get('*/dashboard/calendar', ({ request }) => {
    const query = new URL(request.url).searchParams;
    const year = Number(query.get('year'));
    const month = Number(query.get('month'));
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return ok(mockSchedules.filter((item) => !year || !month || (item.startDate.slice(0, 7) <= prefix && item.endDate.slice(0, 7) >= prefix)));
  }),
  http.get('*/projects/applications/me', () => ok(recruitments.filter((item) => item.hasApplied).map((item) => ({ ...item, status: item.myApplyStatus, applicationId: item.myApplicationId, recruitCount: item.maxMember })))),
  http.get('*/recruitments/bookmark', ({ request }) => ok(page(recruitments.filter((item) => item.isBookmarked), request))),
  http.get('*/recruitments/me', () => ok(recruitments.filter((item) => item.isAuthor))),
  http.get('*/recruitments', ({ request }) => {
    const query = new URL(request.url).searchParams;
    const category = query.get('category');
    const search = (query.get('search') || '').toLowerCase();
    return ok(page(recruitments.filter((item) => (!category || item.category === category) && `${item.title} ${item.description}`.toLowerCase().includes(search)), request));
  }),
  http.get('*/recruitments/:recruitmentId', ({ params }) => {
    const item = findRecruitment(params);
    return item ? ok(item) : missing();
  }),
  http.get('*/recruitments/:recruitmentId/leader-profile', ({ params }) => {
    const item = findRecruitment(params);
    if (!item) return missing();
    return ok({ ...user, name: item.author.nickname, nickname: item.author.nickname, completedTasks: 18, totalTasks: 24, pastProjects: [] });
  }),
  http.post('*/recruitments/:recruitmentId/bookmark', ({ params }) => {
    const item = findRecruitment(params);
    if (!item) return missing();
    item.isBookmarked = !item.isBookmarked;
    return ok({ isBookmarked: item.isBookmarked });
  }),
  http.get('*/recruitments/:recruitmentId/application-form', ({ params }) => {
    const item = findRecruitment(params);
    return item ? ok({ recruitmentTitle: item.title }) : missing();
  }),
  http.post('*/recruitments/:recruitmentId/apply', async ({ params, request }) => {
    const item = findRecruitment(params);
    if (!item) return missing();
    item.hasApplied = true;
    item.myApplyStatus = 'PENDING';
    item.myApplicationId = 100 + item.recruitmentId;
    applications.push({ ...(await request.json()), applicationId: item.myApplicationId, recruitmentId: item.recruitmentId, status: 'PENDING' });
    return ok({ applicationId: item.myApplicationId });
  }),
  ...['pending', 'accepted', 'rejected'].map((status) => http.get(`*/recruitments/:recruitmentId/applications/${status}`, ({ params }) => ok({
    recruitImageUrl: findRecruitment(params)?.recruitImageUrl ?? null,
    applicants: applications.filter((item) => item.recruitmentId === Number(params.recruitmentId) && item.status === status.toUpperCase()),
  }))),
  http.get('*/recruitments/:recruitmentId/applications/:applicationId', ({ params }) => {
    const item = applications.find((item) => item.recruitmentId === Number(params.recruitmentId) && item.applicationId === Number(params.applicationId));
    return item ? ok({ ...item, applicant: { ...item, profileImageUrl: null } }) : missing();
  }),
  http.patch('*/recruitments/:recruitmentId/applications/:applicationId/status', async ({ params, request }) => {
    const item = applications.find((item) => item.recruitmentId === Number(params.recruitmentId) && item.applicationId === Number(params.applicationId));
    if (!item) return missing();
    item.status = (await request.json()).status;
    return ok({ currentParticipants: 1 + applications.filter((entry) => entry.recruitmentId === item.recruitmentId && entry.status === 'ACCEPTED').length, maxParticipants: 5 });
  }),
  http.put('*/recruitments/:recruitmentId/applications/:applicationId', async ({ params, request }) => {
    const recruitment = findRecruitment(params);
    const item = applications.find((entry) => entry.recruitmentId === Number(params.recruitmentId) && entry.applicationId === Number(params.applicationId));
    if (!item || recruitment?.myApplicationId !== item.applicationId) return missing();
    const { objective, prContent } = await request.json();
    Object.assign(item, { objective, prContent });
    return ok({ applicationId: item.applicationId, updatedAt: new Date().toISOString() });
  }),
  http.delete('*/recruitments/:recruitmentId/applications/:applicationId', ({ params }) => {
    const recruitment = findRecruitment(params);
    const index = applications.findIndex((entry) => entry.recruitmentId === Number(params.recruitmentId) && entry.applicationId === Number(params.applicationId));
    if (index < 0 || recruitment?.myApplicationId !== Number(params.applicationId)) return missing();
    applications.splice(index, 1);
    Object.assign(recruitment, { hasApplied: false, myApplyStatus: null, myApplicationId: null });
    return ok(null);
  }),
];
