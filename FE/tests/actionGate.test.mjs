import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createActionGate } from '../src/utils/actionGate.js';

test('rapid clicks run once, while independent buttons remain available', () => {
  let time = 0;
  const gate = createActionGate(500, () => time);
  const other = createActionGate(500, () => time);
  let calls = 0;
  let blocked = 0;
  const action = () => { calls++; };
  for (let i = 0; i < 20; i++) gate.run(action, () => blocked++);
  other.run(action);
  assert.equal(calls, 2);
  assert.equal(blocked, 19);
  time = 500;
  gate.run(action);
  assert.equal(calls, 3);
});

test('slow requests stay locked beyond the cooldown and release after completion', async () => {
  let time = 0;
  let finish;
  let calls = 0;
  const gate = createActionGate(500, () => time);
  const first = gate.run(() => { calls++; return new Promise(resolve => { finish = resolve; }); });
  time = 10000;
  gate.run(() => calls++);
  assert.equal(calls, 1);
  finish();
  await first;
  gate.run(() => calls++);
  assert.equal(calls, 1);
  time += 500;
  gate.run(() => calls++);
  assert.equal(calls, 2);
});

test('failed requests allow retry after cooldown', async () => {
  let time = 0;
  const gate = createActionGate(500, () => time);
  await assert.rejects(gate.run(() => Promise.reject(new Error('network'))), /network/);
  time = 500;
  assert.equal(gate.run(() => 'retried'), 'retried');
});

test('synchronous exceptions do not leave a permanent lock', () => {
  let time = 0;
  const gate = createActionGate(500, () => time);
  assert.throws(() => gate.run(() => { throw new Error('failed'); }), /failed/);
  time = 500;
  assert.equal(gate.run(() => 'retried'), 'retried');
});

test('reentrant actions are blocked before the first handler returns', () => {
  const gate = createActionGate();
  let calls = 0;
  gate.run(() => { calls++; gate.run(() => calls++); });
  assert.equal(calls, 1);
});
