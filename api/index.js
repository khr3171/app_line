import { randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "../server/db.js";
import {
  assert,
  hash,
  passwordCheck,
  passwordHash,
  canSee,
  projectCase,
  text,
  STATUS,
} from "../server/domain.js";
import { sheetRows, preview, syncSheet } from "../server/sheets.js";

const json = (res, status, data) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
};
async function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    assert(raw.length < 64000, "요청 크기가 너무 큽니다.", 413);
  }
  try {
    return JSON.parse(raw || "{}");
  } catch {
    assert(false, "잘못된 요청 형식입니다.");
  }
}
async function audit(user, action, target = "") {
  await db()
    .collection("audit")
    .add({ actor: user.id, action, target, at: new Date().toISOString() });
}
async function session(req) {
  const cookie = (req.headers.cookie || "")
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("session="))
    ?.slice(8);
  assert(cookie, "로그인이 필요합니다.", 401);
  const ref = db().doc("sessions/" + hash(cookie));
  const s = (await ref.get()).data();
  assert(s && s.expiresAt > Date.now(), "다시 로그인해 주세요.", 401);
  const user = (
    await db()
      .doc("accounts/" + s.uid)
      .get()
  ).data();
  assert(user?.active, "이용이 중지된 계정입니다.", 401);
  assert(
    s.version === (user.version || 0),
    "계정 정보가 변경되었습니다. 다시 로그인해 주세요.",
    401,
  );
  return { user, ref };
}
function publicUser(u) {
  const { passwordHash, ...safe } = u;
  return safe;
}
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const url = new URL(req.url, "http://local");
  const action =
    url.searchParams.get("action") || req.query?.action || "health";
  try {
    if (action === "health") {
      assert(req.method === "GET", "허용되지 않은 요청입니다.", 405);
      return json(res, 200, { configured: !!process.env.FIREBASE_PROJECT_ID });
    }
    assert(
      ["GET", "POST"].includes(req.method),
      "허용되지 않은 요청입니다.",
      405,
    );
    const b = req.method === "POST" ? await body(req) : {};
    if (action === "webhook") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      const expected = process.env.SHEETS_WEBHOOK_SECRET || "";
      const supplied = req.headers["x-sheet-secret"] || "";
      assert(
        expected.length >= 32 && hash(expected) === hash(supplied),
        "인증에 실패했습니다.",
        401,
      );
      const result = await syncSheet();
      return json(res, 200, result);
    }
    if (req.method === "POST") {
      assert(process.env.APP_ORIGIN, "APP_ORIGIN 설정이 필요합니다.", 503);
      assert(
        req.headers.origin === process.env.APP_ORIGIN,
        "허용되지 않은 출처입니다.",
        403,
      );
    }
    if (action === "login") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      const username = text(b.username, 80),
        password = text(b.password, 200);
      const key = hash(
        (
          req.headers["x-forwarded-for"] ||
          req.socket?.remoteAddress ||
          "unknown"
        ).split(",")[0] +
          ":" +
          username,
      );
      const rate = db().doc("rateLimits/" + key);
      await db().runTransaction(async (tx) => {
        const r = (await tx.get(rate)).data();
        const window =
          r?.until > Date.now() ? r : { count: 0, until: Date.now() + 900000 };
        assert(
          window.count < 10,
          "로그인 시도가 많습니다. 15분 후 다시 시도해 주세요.",
          429,
        );
        tx.set(rate, { count: window.count + 1, until: window.until });
      });
      const u = (
        await db()
          .doc("accounts/" + hash(username))
          .get()
      ).data();
      assert(
        u?.active &&
          passwordCheck(password, u.passwordHash) &&
          u.role === b.role,
        "아이디, 비밀번호 또는 로그인 구분을 확인해 주세요.",
        401,
      );
      await rate.delete();
      const token = randomBytes(32).toString("hex");
      await db()
        .doc("sessions/" + hash(token))
        .set({
          uid: u.id,
          version: u.version || 0,
          expiresAt: Date.now() + 8 * 3600000,
        });
      res.setHeader(
        "Set-Cookie",
        `session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.APP_ORIGIN?.startsWith("https:") ? "; Secure" : ""}`,
      );
      await audit(u, "login");
      return json(res, 200, { user: publicUser(u) });
    }
    const { user, ref: sessionRef } = await session(req);
    if (action === "logout") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      await sessionRef.delete();
      res.setHeader(
        "Set-Cookie",
        "session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
      );
      return json(res, 200, { ok: true });
    }
    if (action === "me") return json(res, 200, { user: publicUser(user) });
    if (action === "password") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      assert(
        passwordCheck(text(b.current, 200), user.passwordHash),
        "현재 비밀번호를 확인해 주세요.",
      );
      assert(
        typeof b.next === "string" &&
          b.next.length >= 10 &&
          b.next.length <= 128 &&
          b.next !== b.current,
        "새 비밀번호는 기존과 다른 10~128자리로 설정해 주세요.",
      );
      await db()
        .doc("accounts/" + user.id)
        .update({
          passwordHash: passwordHash(b.next),
          mustChangePassword: false,
          version: (user.version || 0) + 1,
        });
      await sessionRef.update({ version: (user.version || 0) + 1 });
      await audit(user, "password.change");
      return json(res, 200, {
        user: publicUser({ ...user, mustChangePassword: false }),
      });
    }
    assert(
      !user.mustChangePassword,
      "초기 비밀번호를 먼저 변경해 주세요.",
      403,
    );
    if (action === "state") {
      let query = db().collection("cases");
      if (user.role !== "admin")
        query = query.where("agencyIds", "array-contains", user.agencyId);
      const [cases, agencies] = await Promise.all([
        query.get(),
        db().collection("agencies").get(),
      ]);
      const result = {
        cases: cases.docs.map((s) => projectCase(user, s.data())),
        agencies: agencies.docs.map((s) => s.data()),
      };
      if (user.role === "admin") {
        result.meetings = (await db().collection("meetings").get()).docs.map(
          (s) => s.data(),
        );
        result.accounts = (await db().collection("accounts").get()).docs.map(
          (s) => publicUser(s.data()),
        );
        result.sheet = (await db().doc("settings/sheets").get()).data() || {};
      }
      return json(res, 200, result);
    }
    if (action === "note") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      const content = text(b.content, 4000);
      assert(content, "의견을 입력해 주세요.");
      const caseRef = db().doc("cases/" + text(b.id, 50));
      await db().runTransaction(async (tx) => {
        const record = (await tx.get(caseRef)).data();
        assert(record && canSee(user, record), "열람 권한이 없습니다.", 403);
        const service = record.services.find((s) => s.id === b.serviceId);
        assert(service, "프로그램을 선택해 주세요.");
        assert(
          user.role === "admin" || service.agencyId === user.agencyId,
          "이 프로그램의 담당 기관만 의견을 남길 수 있습니다.",
          403,
        );
        const note = {
          id: randomBytes(12).toString("hex"),
          serviceId: service.id,
          program: service.program,
          content,
          author: user.displayName,
          agencyId: user.agencyId || "admin",
          at: new Date().toISOString(),
        };
        tx.update(caseRef, {
          notes: [...(record.notes || []), note],
          updatedAt: new Date().toISOString(),
        });
      });
      await audit(user, "case.note", b.id);
      return json(res, 200, { ok: true });
    }
    assert(user.role === "admin", "관리자만 이용할 수 있습니다.", 403);
    if (action === "private") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      await audit(user, "case.private.view", text(b.id, 50));
      return json(
        res,
        200,
        (
          await db()
            .doc("privateCases/" + text(b.id, 50))
            .get()
        ).data() || { name: "" },
      );
    }
    if (action === "service") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      assert(STATUS.includes(b.status), "상태를 확인해 주세요.");
      const agencyId = text(b.agencyId, 80);
      if (agencyId)
        assert(
          (
            await db()
              .doc("agencies/" + agencyId)
              .get()
          ).exists,
          "기관을 확인해 주세요.",
        );
      const caseRef = db().doc("cases/" + text(b.id, 50));
      await db().runTransaction(async (tx) => {
        const record = (await tx.get(caseRef)).data();
        assert(record, "대상자를 찾지 못했습니다.");
        const services = record.services.map((s) =>
          s.id === b.serviceId
            ? {
                ...s,
                status: b.status,
                agencyId,
                startDate: text(b.startDate, 10),
                endDate: text(b.endDate, 10),
              }
            : s,
        );
        assert(
          services.some((s) => s.id === b.serviceId),
          "프로그램을 확인해 주세요.",
        );
        assert(
          !b.startDate || !b.endDate || b.endDate >= b.startDate,
          "종료일을 확인해 주세요.",
        );
        const history = {
          id: randomBytes(12).toString("hex"),
          program: services.find((s) => s.id === b.serviceId).program,
          content: "서비스 상태 변경: " + b.status,
          author: user.displayName,
          at: new Date().toISOString(),
          system: true,
        };
        tx.update(caseRef, {
          services,
          agencyIds: [
            ...new Set(services.map((s) => s.agencyId).filter(Boolean)),
          ],
          notes: [...(record.notes || []), history],
          updatedAt: new Date().toISOString(),
        });
      });
      await audit(user, "case.service", b.id);
      return json(res, 200, { ok: true });
    }
    if (action === "caution") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      await db()
        .doc("cases/" + text(b.id, 50))
        .update({
          cautions: text(b.content, 4000),
          updatedAt: new Date().toISOString(),
        });
      await audit(user, "case.caution", b.id);
      return json(res, 200, { ok: true });
    }
    if (action === "meeting") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      assert(
        text(b.title, 120) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(b.date),
        "회의명과 일시를 입력해 주세요.",
      );
      const id = b.id ? text(b.id, 50) : randomBytes(12).toString("hex");
      await db()
        .doc("meetings/" + id)
        .set({
          id,
          title: text(b.title, 120),
          date: b.date,
          place: text(b.place, 200),
          agenda: text(b.agenda, 4000),
          minutes: text(b.minutes, 8000),
          status: b.status === "완료" ? "완료" : "예정",
          updatedAt: new Date().toISOString(),
        });
      await audit(user, "meeting.save", id);
      return json(res, 200, { ok: true });
    }
    if (action === "account") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      const username = text(b.username, 80);
      assert(
        username && ["admin", "agency"].includes(b.role),
        "계정 정보를 확인해 주세요.",
      );
      assert(
        b.role !== "agency" || text(b.agencyId, 80),
        "소속 기관을 선택해 주세요.",
      );
      const id = hash(username);
      const existing = (
        await db()
          .doc("accounts/" + id)
          .get()
      ).data();
      assert(!existing, "이미 등록된 아이디입니다.");
      assert(
        typeof b.password === "string" &&
          b.password.length >= 10 &&
          b.password.length <= 128,
        "임시 비밀번호는 10~128자리로 입력해 주세요.",
      );
      if (b.role === "agency")
        assert(
          (
            await db()
              .doc("agencies/" + text(b.agencyId, 80))
              .get()
          ).exists,
          "기관을 먼저 등록해 주세요.",
        );
      await db()
        .doc("accounts/" + id)
        .create({
          id,
          username,
          displayName: text(b.displayName, 100) || username,
          role: b.role,
          agencyId: b.role === "agency" ? text(b.agencyId, 80) : "",
          active: true,
          mustChangePassword: true,
          passwordHash: passwordHash(b.password),
          version: 0,
        });
      await audit(user, "account.create", id);
      return json(res, 200, { ok: true });
    }
    if (action === "accountReset") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      assert(
        b.id !== user.id,
        "본인 비밀번호는 상단 계정 메뉴에서 변경해 주세요.",
      );
      assert(
        typeof b.password === "string" &&
          b.password.length >= 10 &&
          b.password.length <= 128,
        "임시 비밀번호는 10~128자리로 입력해 주세요.",
      );
      const ref = db().doc("accounts/" + text(b.id, 80));
      const old = (await ref.get()).data();
      assert(old, "계정을 찾지 못했습니다.");
      await ref.update({
        passwordHash: passwordHash(b.password),
        mustChangePassword: true,
        version: (old.version || 0) + 1,
      });
      await audit(user, "account.reset", b.id);
      return json(res, 200, { ok: true });
    }
    if (action === "accountToggle") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      assert(b.id !== user.id, "현재 로그인한 계정은 중지할 수 없습니다.");
      const ref = db().doc("accounts/" + text(b.id, 80));
      const old = (await ref.get()).data();
      assert(old, "계정을 찾지 못했습니다.");
      await ref.update({
        active: !old.active,
        version: (old.version || 0) + 1,
      });
      await audit(user, "account.toggle", b.id);
      return json(res, 200, { ok: true });
    }
    if (action === "agency") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      assert(text(b.name, 120), "기관명을 입력해 주세요.");
      const id = randomBytes(12).toString("hex");
      await db()
        .doc("agencies/" + id)
        .set({ id, name: text(b.name, 120), type: text(b.type, 80) });
      await audit(user, "agency.create", id);
      return json(res, 200, { ok: true });
    }
    if (action === "sheetHeaders")
      return json(res, 200, { headers: (await sheetRows())[0] || [] });
    if (action === "sheetPreview") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      return json(res, 200, await preview(b.mapping));
    }
    if (action === "sheetMapping") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      const result = await preview(b.mapping);
      assert(!result.errors.length, "시트 검증 오류를 먼저 수정해 주세요.");
      await db()
        .doc("settings/sheets")
        .set({ mapping: b.mapping }, { merge: true });
      await audit(user, "sheet.mapping");
      return json(res, 200, { ok: true });
    }
    if (action === "sheetSync") {
      assert(req.method === "POST", "허용되지 않은 요청입니다.", 405);
      return json(res, 200, await syncSheet(user.id));
    }
    assert(false, "지원하지 않는 요청입니다.", 404);
  } catch (e) {
    const status = e.status || 500;
    return json(res, status, {
      error:
        status === 500
          ? "서버 처리 중 오류가 발생했습니다. 연결 설정을 확인해 주세요."
          : e.message,
    });
  }
}
