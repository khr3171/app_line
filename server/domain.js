import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
export const CHILD = [
  "진단검사 지원",
  "부모상담 및 치료프로그램",
  "방학단기프로그램",
  "바우처 지원 연계",
  "유소년 축구교실",
];
export const YOUTH = [
  "상담",
  "사례관리 계획",
  "자립교육",
  "일경험처 연계",
  "사후관리",
];
export const STATUS = [
  "접수",
  "검토 중",
  "연계 대기",
  "진행 중",
  "완료",
  "보류",
];
export const hash = (s) => createHash("sha256").update(s).digest("hex");
export function passwordHash(password) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function passwordCheck(password, stored) {
  const [salt, key] = (stored || "").split(":");
  if (!salt || !key) return false;
  const a = scryptSync(password, salt, 64),
    b = Buffer.from(key, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
export function assert(
  ok,
  message = "요청을 처리할 수 없습니다.",
  status = 400,
) {
  if (!ok) throw Object.assign(new Error(message), { status });
}
export function canSee(user, record) {
  return (
    user.role === "admin" || (record.agencyIds || []).includes(user.agencyId)
  );
}
export function projectCase(user, record) {
  const { name, guardian, contact, ...safe } = record;
  return safe;
}
export function text(value, max = 2000) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}
export function birth6(value) {
  const s = String(value ?? "").replace(/\D/g, "");
  const b = s.length === 8 ? s.slice(2) : s;
  assert(/^\d{6}$/.test(b), "생년월일은 6자리 또는 8자리여야 합니다.");
  const year = Number(
    s.length === 8
      ? s.slice(0, 4)
      : (Number(b.slice(0, 2)) <=
        Number(String(new Date().getFullYear()).slice(2))
          ? "20"
          : "19") + b.slice(0, 2),
  );
  const month = Number(b.slice(2, 4)),
    day = Number(b.slice(4, 6));
  const date = new Date(Date.UTC(year, month - 1, day));
  assert(
    date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day &&
      date.getUTCFullYear() === year &&
      date <= new Date(),
    "올바른 생년월일을 입력해 주세요.",
  );
  return b;
}
export function ageOf(b, today = new Date()) {
  const yy = Number(b.slice(0, 2)),
    year = (yy <= today.getFullYear() % 100 ? 2000 : 1900) + yy;
  let age = today.getFullYear() - year;
  if (
    Number(b.slice(2)) >
    Number(
      String(today.getMonth() + 1).padStart(2, "0") +
        String(today.getDate()).padStart(2, "0"),
    )
  )
    age--;
  return age;
}
export function normalizeRows(rows, mapping) {
  assert(rows.length > 1, "시트에 접수 데이터가 없습니다.");
  const headers = rows[0];
  for (const key of ["sourceId", "birth", "group", "programs"])
    assert(headers.includes(mapping[key]), "필수 열 연결을 확인해 주세요.");
  const seen = new Set(),
    records = [],
    errors = [];
  rows.slice(1).forEach((row, index) => {
    if (!row.some((v) => String(v).trim())) return;
    try {
      const get = (k) => String(row[headers.indexOf(mapping[k])] ?? "").trim();
      const sourceId = get("sourceId");
      assert(sourceId, "접수ID가 비어 있습니다.");
      assert(!seen.has(sourceId), "중복 접수ID입니다.");
      seen.add(sourceId);
      const birth = birth6(get("birth"));
      const group = get("group");
      assert(
        ["아동청소년", "청년"].includes(group),
        "대상구분은 아동청소년 또는 청년이어야 합니다.",
      );
      const selected = get("programs")
          .split(/[,;\n]/)
          .map((v) => v.trim())
          .filter(Boolean),
        allowed = group === "청년" ? YOUTH : CHILD;
      assert(
        selected.length && selected.every((p) => allowed.includes(p)),
        "지원 프로그램 명칭을 확인해 주세요.",
      );
      const scoreText = get("score");
      const score = scoreText === "" ? null : Number(scoreText);
      assert(
        score === null || Number.isFinite(score),
        "검사점수는 숫자여야 합니다.",
      );
      records.push({
        sourceId,
        birth,
        group,
        name: text(get("name"), 100),
        age: ageOf(birth),
        score,
        request: text(get("request")),
        receivedAt: text(get("receivedAt"), 80),
        programs: selected,
      });
    } catch (e) {
      errors.push({ row: index + 2, message: e.message });
    }
  });
  return { records, errors };
}
