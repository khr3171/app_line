import { db } from "./db.js";
import { hash, passwordHash } from "./domain.js";
// node --env-file=.env server/bootstrap.js 로도 실행 가능
const id = hash("사서원");
const ref = db().doc("accounts/" + id);
await ref.create({
  id,
  username: "사서원",
  displayName: "사서원 관리자",
  role: "admin",
  agencyId: "",
  active: true,
  mustChangePassword: true,
  passwordHash: passwordHash("1234"),
  version: 0,
});
console.log(
  "초기 관리자 계정 생성 완료. 첫 로그인 후 비밀번호 변경이 필요합니다.",
);
