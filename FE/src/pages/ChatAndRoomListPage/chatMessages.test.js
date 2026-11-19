import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeChatMessages, toChatMessage } from './chatMessages.js';

const message = (messageId, senderId = 3) => ({
  messageId, senderId, chatRoomId: 2, senderName: '홍길동',
  senderProfileImageUrl: null, content: `메시지 ${messageId}`,
  createdAt: `2026-11-11T19:3${messageId}:00`,
});

test('늦게 도착한 이전 내역을 합쳐도 실시간 메시지를 유지하고 중복 없이 시간순으로 표시한다', () => {
  const live = [toChatMessage(message(3), '2', '3'), toChatMessage(message(2), '2', '3')];
  const history = [toChatMessage(message(2), '2', '3'), toChatMessage(message(1), '2', '3')];
  assert.deepEqual(mergeChatMessages(live, history).map((item) => item.id), ['1', '2', '3']);
  assert.equal(live.length, 2);
  assert.deepEqual(mergeChatMessages(live, []).map((item) => item.id), ['2', '3']);
});

test('조회 내역과 실시간 메시지 모두 발신자 ID로 내 메시지를 구분한다', () => {
  assert.equal(toChatMessage(message(1), '2', '3').isMine, true);
  assert.equal(toChatMessage(message(2, 4), '2', '3').isMine, false);
  assert.equal(toChatMessage(message(1), '2', undefined).isMine, false);
});

test('다른 채팅방 또는 잘못된 메시지는 표시하지 않는다', () => {
  assert.equal(toChatMessage(message(1), '9', 3), null);
  assert.equal(toChatMessage({ ...message(1), createdAt: 'invalid' }, '2', 3), null);
  assert.equal(toChatMessage(null, '2', 3), null);
});
