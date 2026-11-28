import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRecruitmentImages } from './resolveRecruitmentImages.js';

test('fills missing list images from recruitment details and preserves list data', async () => {
  const rows = [{ recruitmentId: 1, title: 'Study' }, { id: 2, recruitImageUrl: null }];
  const result = await resolveRecruitmentImages(rows, async (id) => ({ recruitImageUrl: `/image-${id}.png` }));
  assert.deepEqual(result, [
    { recruitmentId: 1, title: 'Study', recruitImageUrl: '/image-1.png' },
    { id: 2, recruitImageUrl: '/image-2.png' },
  ]);
  assert.equal(rows[0].recruitImageUrl, undefined);
});

test('keeps existing images without additional requests', async () => {
  const row = { postId: 3, recruitImageUrl: '/existing.png' };
  assert.deepEqual(await resolveRecruitmentImages([row], () => assert.fail('unexpected request')), [row]);
});

test('detail failures and images that are not registered leave the list usable', async () => {
  const rows = [{ recruitmentId: 1 }, { postId: 2 }, { title: 'No ID' }];
  const result = await resolveRecruitmentImages(rows, async (id) => {
    if (id === 1) throw new Error('unavailable');
    return { recruitImageUrl: null };
  });
  assert.deepEqual(result, [rows[0], { postId: 2, recruitImageUrl: null }, rows[2]]);
});
