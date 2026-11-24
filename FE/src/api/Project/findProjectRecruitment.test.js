import test from 'node:test';
import assert from 'node:assert/strict';
import { findProjectRecruitment } from './findProjectRecruitment.js';

test('finds a project by detail ID across paginated postId lists', async () => {
  const calls = [];
  const result = await findProjectRecruitment('47', {
    getPage: async (page) => ({ content: [{ postId: page === 0 ? 56 : 48 }], totalPages: 2 }),
    getDetail: async (id) => {
      calls.push(id);
      return { projectId: id === 48 ? 47 : 2, content: '실제 소개' };
    },
  });
  assert.equal(result.recruitmentId, 48);
  assert.equal(result.content, '실제 소개');
  assert.deepEqual(calls, [56, 48]);
});

test('never substitutes postId for a missing projectId', async () => {
  await assert.rejects(findProjectRecruitment(47, {
    getPage: async () => ({ content: [{ postId: 47 }], last: true }),
    getDetail: async () => ({ title: '동일한 이름' }),
  }), /연결된 모집글/);
});

test('preserves authorization failures', async () => {
  const error = Object.assign(new Error('Forbidden'), { response: { status: 403 } });
  await assert.rejects(findProjectRecruitment(47, {
    getPage: async () => [{ postId: 48 }],
    getDetail: async () => { throw error; },
  }), (actual) => actual === error);
});
