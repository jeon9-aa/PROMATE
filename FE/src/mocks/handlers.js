import { delay, http, HttpResponse } from 'msw';
import { mockMembers, mockPosts, mockProject, mockSchedules, mockTasks } from './data.js';

const ok = (data, message = '요청이 성공했습니다.') =>
  HttpResponse.json({ isSuccess: true, message, data });

const notFound = (message) =>
  HttpResponse.json(
    { isSuccess: false, message, data: null },
    { status: 404 },
  );

const getProgress = () => {
  if (mockTasks.length === 0) return 0;
  const completedCount = mockTasks.filter((task) => task.status === 'DONE').length;
  return Math.round((completedCount / mockTasks.length) * 100);
};

const getMember = (managerId) =>
  mockMembers.find((member) => member.userId === Number(managerId));

const mockPostComments = [
  { commentId: 1, postId: 1, writerName: '김철수', content: '고생하셨습니다! 디자인 파트 오늘까지 마무리할게요.', createdAt: '2026-02-09T13:00:00' },
  { commentId: 2, postId: 1, writerName: '김영희', content: '디자인 시안 공유드렸는데 확인 부탁드려요.', createdAt: '2026-02-09T14:00:00' },
  { commentId: 3, postId: 1, writerName: '홍길동', content: '다음 회의는 목요일 그대로 진행할까요?', createdAt: '2026-02-10T09:00:00' },
];

export const handlers = [
  http.get('*/projects/:projectId/members', async () => {
    await delay(150);
    return ok(mockMembers);
  }),

  http.get('*/projects/:projectId/tasks', async () => {
    await delay(150);
    return ok({
      projectTitle: mockProject.title,
      taskList: mockTasks,
      projectProgress: getProgress(),
    });
  }),

  http.get('*/projects/:projectId/tasks/:taskId', async ({ params }) => {
    await delay(100);
    const task = mockTasks.find((item) => item.taskId === Number(params.taskId));
    return task ? ok(task) : notFound('태스크를 찾을 수 없습니다.');
  }),

  http.post('*/projects/:projectId/tasks', async ({ request }) => {
    const body = await request.json();
    const member = getMember(body.managerId);
    const task = {
      taskId: Math.max(0, ...mockTasks.map((item) => item.taskId)) + 1,
      ...body,
      managerId: Number(body.managerId),
      managerName: member?.name || '담당자 미정',
      role: member?.role || '역할 지정 없음',
      status: body.status || 'TODO',
    };
    mockTasks.unshift(task);
    return ok(task, '태스크가 생성되었습니다.');
  }),

  http.put('*/projects/:projectId/tasks/:taskId', async ({ params, request }) => {
    const index = mockTasks.findIndex((item) => item.taskId === Number(params.taskId));
    if (index < 0) return notFound('태스크를 찾을 수 없습니다.');

    const body = await request.json();
    const member = getMember(body.managerId);
    mockTasks[index] = {
      ...mockTasks[index],
      ...body,
      managerId: Number(body.managerId),
      managerName: member?.name || mockTasks[index].managerName,
      role: member?.role || body.role || mockTasks[index].role,
    };
    return ok(mockTasks[index], '태스크가 수정되었습니다.');
  }),

  http.patch('*/projects/:projectId/tasks/:taskId/status', async ({ params, request }) => {
    const task = mockTasks.find((item) => item.taskId === Number(params.taskId));
    if (!task) return notFound('태스크를 찾을 수 없습니다.');

    const { status } = await request.json();
    task.status = status;
    return ok({ projectProgress: getProgress() }, '태스크 상태가 변경되었습니다.');
  }),

  http.delete('*/projects/:projectId/tasks/:taskId', ({ params }) => {
    const index = mockTasks.findIndex((item) => item.taskId === Number(params.taskId));
    if (index < 0) return notFound('태스크를 찾을 수 없습니다.');
    mockTasks.splice(index, 1);
    return ok(null, '태스크가 삭제되었습니다.');
  }),

  http.get('*/projects/:projectId/posts', async () => {
    await delay(150);
    const postList = mockPosts.map((post) => ({
      ...post,
      commentCount: mockPostComments.filter((comment) => comment.postId === post.postId).length,
    }));
    return ok(postList);
  }),

  http.get('*/projects/:projectId/posts/:postId', async ({ params }) => {
    await delay(100);
    const post = mockPosts.find((item) => item.postId === Number(params.postId));
    if (post) {
      post.commentList = mockPostComments.filter(
        (comment) => comment.postId === Number(params.postId),
      );
    }
    return post ? ok(post) : notFound('게시글을 찾을 수 없습니다.');
  }),

  http.get('*/projects/:projectId/posts/:postId/comments', async ({ params }) => {
    await delay(100);
    const commentList = mockPostComments
      .filter((comment) => comment.postId === Number(params.postId))
      .map((comment) => ({
        commentId: comment.commentId,
        comment: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt ?? comment.createdAt,
      }));

    return HttpResponse.json({
      isSuccess: true,
      code: 'COMMENT_S002',
      message: '댓글 조회에 성공했습니다.',
      data: { count: commentList.length, commentList },
    });
  }),

  http.post('*/projects/:projectId/posts/:postId/comments', async ({ params, request }) => {
    const body = await request.json();
    const createdAt = new Date().toISOString();
    const newComment = {
      commentId: Math.max(0, ...mockPostComments.map((item) => item.commentId)) + 1,
      postId: Number(params.postId),
      writerName: '김프로',
      content: body.comment,
      createdAt,
    };
    mockPostComments.push(newComment);
    return HttpResponse.json({
      isSuccess: true,
      code: 'COMMENT_S001',
      message: '댓글 추가에 성공했습니다.',
      data: { commentId: newComment.commentId, createdAt },
    });
  }),

  http.post('*/projects/:projectId/posts', async ({ request }) => {
    const body = await request.json();
    const post = {
      postId: Math.max(0, ...mockPosts.map((item) => item.postId)) + 1,
      ...body,
      writerName: '김프론트',
      createdAt: new Date().toISOString(),
    };
    mockPosts.unshift(post);
    return ok(post, '게시글이 생성되었습니다.');
  }),

  http.put('*/projects/:projectId/posts/:postId', async ({ params, request }) => {
    const index = mockPosts.findIndex((item) => item.postId === Number(params.postId));
    if (index < 0) return notFound('게시글을 찾을 수 없습니다.');
    mockPosts[index] = { ...mockPosts[index], ...(await request.json()) };
    return ok(mockPosts[index], '게시글이 수정되었습니다.');
  }),

  http.delete('*/projects/:projectId/posts/:postId', ({ params }) => {
    const index = mockPosts.findIndex((item) => item.postId === Number(params.postId));
    if (index < 0) return notFound('게시글을 찾을 수 없습니다.');
    mockPosts.splice(index, 1);
    return ok(null, '게시글이 삭제되었습니다.');
  }),

  http.get('*/projects/:projectId/schedules', async ({ params, request }) => {
    await delay(150);
    const url = new URL(request.url);
    const year = Number(url.searchParams.get('year'));
    const month = Number(url.searchParams.get('month'));
    const schedules = mockSchedules.filter((schedule) => {
      if (schedule.projectId !== Number(params.projectId)) return false;
      if (!year || !month) return true;
      const start = new Date(`${schedule.startDate}T00:00:00`);
      const end = new Date(`${schedule.endDate}T00:00:00`);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59);
      return start <= monthEnd && end >= monthStart;
    });
    return ok(schedules);
  }),

  http.get('*/projects/:projectId/schedules/:scheduleId', ({ params }) => {
    const schedule = mockSchedules.find(
      (item) => item.scheduleId === Number(params.scheduleId),
    );
    return schedule ? ok(schedule) : notFound('일정을 찾을 수 없습니다.');
  }),

  http.post('*/projects/:projectId/schedules', async ({ params, request }) => {
    const body = await request.json();
    const schedule = {
      scheduleId: Math.max(0, ...mockSchedules.map((item) => item.scheduleId)) + 1,
      projectId: Number(params.projectId),
      projectTitle: mockProject.title,
      ...body,
    };
    mockSchedules.push(schedule);
    return ok(schedule, '일정이 생성되었습니다.');
  }),

  http.put('*/projects/:projectId/schedules/:scheduleId', async ({ params, request }) => {
    const index = mockSchedules.findIndex(
      (item) => item.scheduleId === Number(params.scheduleId),
    );
    if (index < 0) return notFound('일정을 찾을 수 없습니다.');
    mockSchedules[index] = { ...mockSchedules[index], ...(await request.json()) };
    return ok(mockSchedules[index], '일정 수정이 완료되었습니다.');
  }),

  http.delete('*/projects/:projectId/schedules/:scheduleId', ({ params }) => {
    const index = mockSchedules.findIndex(
      (item) => item.scheduleId === Number(params.scheduleId),
    );
    if (index < 0) return notFound('일정을 찾을 수 없습니다.');
    mockSchedules.splice(index, 1);
    return ok(null, '일정 삭제가 완료되었습니다.');
  }),
];
