import test from "node:test";
import assert from "node:assert/strict";
import { matchesServices } from "../src/data.js";
test("프로그램과 상태 필터는 동일 서비스에 함께 적용", () => {
  const record = {
    services: [
      { program: "상담", status: "완료" },
      { program: "자립교육", status: "접수" },
    ],
  };
  assert.equal(matchesServices(record, "자립교육", "완료"), false);
  assert.equal(matchesServices(record, "자립교육", "접수"), true);
  assert.equal(matchesServices(record, "전체", "완료"), true);
});
