import test from 'node:test';
import assert from 'node:assert/strict';
import { openRecruitmentChat } from './openRecruitmentChat.js';

test('opens the existing room for this recruitment without creating another', async () => {
  const expected = { recruitId: 6, chatRoomId: 42 };
  const result = await openRecruitmentChat('6', {
    getRooms: async () => [{ recruitId: 7, chatRoomId: 41 }, expected],
    createRoom: async () => assert.fail('must reuse the existing room'),
  });
  assert.equal(result, expected);
});

test('creates a room when only other recruitments have rooms', async () => {
  const result = await openRecruitmentChat('6', {
    getRooms: async () => [{ recruitId: 7, chatRoomId: 41 }],
    createRoom: async (id) => {
      assert.equal(id, '6');
      return { chatRoomId: 42 };
    },
  });
  assert.equal(result.chatRoomId, 42);
});

test('recovers an existing room when creation races with another request', async () => {
  let calls = 0;
  const result = await openRecruitmentChat('6', {
    getRooms: async () => ++calls === 1 ? [] : [{ recruitId: 6, chatRoomId: 42 }],
    createRoom: async () => { throw { response: { status: 400 } }; },
  });
  assert.equal(result.chatRoomId, 42);
});

test('preserves creation errors if no matching room exists', async () => {
  const error = new Error('creation failed');
  error.response = { status: 400 };
  await assert.rejects(openRecruitmentChat('6', {
    getRooms: async () => [{ recruitId: 7, chatRoomId: 41 }],
    createRoom: async () => { throw error; },
  }), (actual) => actual === error);
});

test('does not create a room when the initial lookup fails', async () => {
  await assert.rejects(openRecruitmentChat('6', {
    getRooms: async () => { throw new Error('lookup failed'); },
    createRoom: async () => assert.fail('lookup must succeed first'),
  }), /lookup failed/);
});
