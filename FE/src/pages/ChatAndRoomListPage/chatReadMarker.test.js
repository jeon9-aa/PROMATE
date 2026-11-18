import test from 'node:test';
import assert from 'node:assert/strict';
import { createChatReadMarker } from './chatReadMarker.js';

test('숨겨진 탭의 읽음 요청을 보류했다가 보일 때 처리한다', async () => {
  let visible = false;
  let calls = 0;
  const marker = createChatReadMarker({
    isVisible: () => visible, markRead: async () => { calls++; },
    onSuccess() {}, onError() { assert.fail('unexpected error'); },
  });
  await marker.request();
  await marker.request();
  assert.equal(calls, 0);
  visible = true;
  await marker.flush();
  assert.equal(calls, 1);
  await marker.flush();
  assert.equal(calls, 1);
});

test('읽음 요청 도중 수신한 메시지는 후속 요청 하나로 처리한다', async () => {
  let finish;
  let calls = 0;
  const marker = createChatReadMarker({
    isVisible: () => true,
    markRead: () => ++calls === 1 ? new Promise((resolve) => { finish = resolve; }) : Promise.resolve(),
    onSuccess() {}, onError() { assert.fail('unexpected error'); },
  });
  const first = marker.request();
  await marker.request();
  await marker.request();
  assert.equal(calls, 1);
  finish();
  await first;
  assert.equal(calls, 2);
});

test('실패한 읽음 처리는 재시도할 수 있고 방 이동 후에는 결과를 반영하지 않는다', async () => {
  let calls = 0;
  let errors = 0;
  let successes = 0;
  let finish;
  let signal;
  const marker = createChatReadMarker({
    isVisible: () => true,
    markRead: async (requestSignal) => {
      signal = requestSignal;
      if (++calls === 1) throw new Error('network');
      await new Promise((resolve) => { finish = resolve; });
    },
    onSuccess: () => { successes++; }, onError: () => { errors++; },
  });
  await marker.request();
  assert.equal(errors, 1);
  const retry = marker.flush();
  assert.equal(calls, 2);
  marker.dispose();
  assert.equal(signal.aborted, true);
  finish();
  await retry;
  assert.equal(successes, 0);
  await marker.request();
  assert.equal(calls, 2);
});
