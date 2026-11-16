import test from "node:test";
import assert from "node:assert/strict";
import { formatTime, formatDate } from "../src/data.js";
test("Google 폼 한국어 타임스탬프와 ISO 시간을 표시", () => {
  assert.match(formatTime("2026. 11. 16 오후 2:30:00"), /2:30/);
  assert.match(formatTime("2026-11-16T05:30:00Z"), /2:30/);
  assert.match(formatTime("2026-11-16T14:30"), /2:30/);
  assert.match(formatDate("2026. 11. 16 오후 2:30:00"), /11.*16/);
  assert.equal(formatDate(null), "—");
});
