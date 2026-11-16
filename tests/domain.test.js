import test from "node:test";
import assert from "node:assert/strict";
import {
  birth6,
  ageOf,
  passwordHash,
  passwordCheck,
  canSee,
  projectCase,
  normalizeRows,
} from "../server/domain.js";
test("생년월일 선행 0 보존 및 실제 날짜 검증", () => {
  assert.equal(birth6("2001-08-22"), "010822");
  assert.equal(birth6("010822"), "010822");
  assert.throws(() => birth6("230229"));
  assert.throws(() => birth6("991332"));
  assert.equal(birth6("000229"), "000229");
});
test("생일 기준 만 나이", () => {
  assert.equal(ageOf("010822", new Date("2026-08-21T12:00:00")), 24);
  assert.equal(ageOf("010822", new Date("2026-08-22T12:00:00")), 25);
});
test("비밀번호는 salt별 다른 scrypt 해시이며 검증 가능", () => {
  const a = passwordHash("1234"),
    b = passwordHash("1234");
  assert.notEqual(a, b);
  assert.ok(passwordCheck("1234", a));
  assert.ok(!passwordCheck("wrong", a));
  assert.ok(!passwordCheck("1234", "invalid"));
});
test("배정되지 않은 기관은 대상자를 볼 수 없음", () => {
  const r = { agencyIds: ["a1"] };
  assert.ok(canSee({ role: "admin" }, r));
  assert.ok(canSee({ role: "agency", agencyId: "a1" }, r));
  assert.ok(!canSee({ role: "agency", agencyId: "a2" }, r));
});
test("응답에 직접 식별정보 제외", () => {
  const r = {
    name: "민감정보",
    guardian: "보호자",
    contact: "010",
    birth: "010822",
    id: "abc",
  };
  assert.deepEqual(projectCase({ role: "admin" }, r), {
    birth: "010822",
    id: "abc",
  });
});
const mapping = {
  sourceId: "접수ID",
  birth: "생년월일",
  group: "구분",
  programs: "프로그램",
  score: "점수",
  name: "이름",
};
const headers = ["접수ID", "생년월일", "구분", "프로그램", "점수", "이름"];
test("시트 고유값으로 동명이인·같은 생일을 별도 처리", () => {
  const r = normalizeRows(
    [
      headers,
      ["uuid1", "010822", "청년", "상담", "72", "예시"],
      ["uuid2", "010822", "청년", "자립교육", "", "예시"],
    ],
    mapping,
  );
  assert.equal(r.records.length, 2);
  assert.equal(r.records[1].score, null);
  assert.equal(r.errors.length, 0);
});
test("시트 오류행은 번호와 이유 반환, 중복ID 거부", () => {
  const r = normalizeRows(
    [
      headers,
      ["x", "010822", "청년", "상담", "72"],
      ["x", "010822", "청년", "상담", "72"],
      ["z", "230229", "청년", "상담", "72"],
      ["w", "010822", "청년", "알수없음", "72"],
    ],
    mapping,
  );
  assert.equal(r.errors.length, 3);
  assert.deepEqual(
    r.errors.map((e) => e.row),
    [3, 4, 5],
  );
});
test("시트 필수 열 미연결 거부", () => {
  assert.throws(() => normalizeRows([headers, ["x"]], {}));
});
