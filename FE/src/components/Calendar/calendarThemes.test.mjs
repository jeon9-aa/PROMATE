import test from 'node:test';
import assert from 'node:assert/strict';
import { assignProjectColors, CALENDAR_THEMES, getEventTextColor, readThemePreferences } from './calendarThemes.js';

test('project colors are unique up to six projects and balanced for larger counts', () => {
  for (const count of [0, 1, 5, 6, 7, 8, 12, 13, 100]) {
    for (let seed = 0; seed < 100; seed += 1) {
      const assignments = assignProjectColors(Array.from({ length: count }, (_, i) => i), seed);
      const counts = Array(6).fill(0);
      assignments.forEach((color) => { counts[color] += 1; });
      assert.equal(assignments.size, count);
      assert.ok(Math.max(...counts) - Math.min(...counts) <= 1);
      if (count <= 6) assert.equal(new Set(assignments.values()).size, count);
      if (count >= 6) assert.ok(counts.every((value) => value >= 1));
    }
  }
});

test('same project and seed retain colors regardless of API ordering or duplicate schedules', () => {
  assert.deepEqual(assignProjectColors([1, 2, 3, 4], 42), assignProjectColors(['4', 3, 2, 1, 1, null, undefined], 42));
  assert.notDeepEqual(assignProjectColors([1, 2, 3, 4, 5, 6], 42), assignProjectColors([1, 2, 3, 4, 5, 6], 123));
});

test('all theme colors get text with at least 4.5:1 contrast', () => {
  for (const { colors } of CALENDAR_THEMES) {
    assert.equal(colors.length, 6);
    for (const color of colors) {
      const rgb = color.slice(1).match(/../g).map((channel) => parseInt(channel, 16) / 255)
        .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
      const luminance = rgb.reduce((sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i], 0);
      const contrast = getEventTextColor(color) === '#000000' ? (luminance + 0.05) / 0.05 : 1.05 / (luminance + 0.05);
      assert.ok(contrast >= 4.5, color);
    }
  }
});

test('preferences use theme 1 by default and restore valid saved selections', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  let value = null;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => value } });
  try {
    for (const invalid of [null, '{broken', '{}', '{"themeId":"theme-5","seed":1}']) {
      value = invalid;
      assert.equal(readThemePreferences('test').themeId, 'theme-1');
    }
    value = JSON.stringify({ themeId: 'theme-4', seed: 42 });
    assert.deepEqual(readThemePreferences('test'), { themeId: 'theme-4', seed: 42 });
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  }
});
