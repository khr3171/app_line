import { makeData } from "./data";
export const DEMO = import.meta.env.VITE_DEMO_MODE === "true";
const KEY = "together-demo-v1";
let memory;
function read() {
  if (!memory) {
    try {
      memory = JSON.parse(localStorage.getItem(KEY));
    } catch {}
    if (!memory) memory = makeData();
  }
  return memory;
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(memory));
}
function who() {
  try {
    return JSON.parse(sessionStorage.getItem("together-user"));
  } catch {
    return null;
  }
}
function check(admin = false) {
  const u = who();
  if (!u || !read().accounts.some((a) => a.id === u.id && a.active))
    throw Error("다시 로그인해 주세요.");
  if (admin && u.role !== "admin") throw Error("관리자만 이용할 수 있습니다.");
  return u;
}
async function digest(value) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(bytes)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function call(action, data) {
  if (!DEMO) {
    const res = await fetch("/api?action=" + action, {
      method: data ? "POST" : "GET",
      credentials: "same-origin",
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
    });
    const result = await res.json();
    if (!res.ok) throw Error(result.error || "요청에 실패했습니다.");
    return result;
  }
  const state = read();
  if (action === "login") {
    const account = state.accounts.find(
      (a) => a.username === data.username && a.role === data.role && a.active,
    );
    const valid =
      account &&
      (account.demoHash
        ? account.demoHash === (await digest(data.password + account.id))
        : data.password === (account.id === "admin" ? "1234" : "demo1234!"));
    if (!valid)
      throw Error("아이디, 비밀번호 또는 로그인 구분을 확인해 주세요.");
    const { demoHash, ...user } = account;
    sessionStorage.setItem("together-user", JSON.stringify(user));
    return { user };
  }
  if (action === "me") {
    return { user: check() };
  }
  if (action === "logout") {
    sessionStorage.removeItem("together-user");
    return { ok: true };
  }
  const user = check();
  if (action === "state") {
    return {
      ...state,
      cases: state.cases.filter(
        (c) => user.role === "admin" || c.agencyIds.includes(user.agencyId),
      ),
      accounts:
        user.role === "admin"
          ? state.accounts.map(({ demoHash, ...a }) => a)
          : [],
      meetings: user.role === "admin" ? state.meetings : [],
    };
  }
  if (action === "password") {
    const account = state.accounts.find((a) => a.id === user.id);
    const ok = account.demoHash
      ? account.demoHash === (await digest(data.current + account.id))
      : data.current === (account.id === "admin" ? "1234" : "demo1234!");
    if (!ok) throw Error("현재 비밀번호를 확인해 주세요.");
    if (data.next.length < 10 || data.next === data.current)
      throw Error("새 비밀번호는 기존과 다른 10자리 이상으로 설정해 주세요.");
    account.demoHash = await digest(data.next + account.id);
    account.mustChangePassword = false;
    save();
    const { demoHash, ...u } = account;
    sessionStorage.setItem("together-user", JSON.stringify(u));
    return { user: u };
  }
  const record = data?.id ? state.cases.find((c) => c.id === data.id) : null;
  if (action === "note") {
    if (
      !record ||
      (user.role !== "admin" && !record.agencyIds.includes(user.agencyId))
    )
      throw Error("열람 권한이 없습니다.");
    const s = record.services.find((s) => s.id === data.serviceId);
    if (!s || (user.role !== "admin" && s.agencyId !== user.agencyId))
      throw Error("담당 프로그램을 선택해 주세요.");
    if (!data.content.trim()) throw Error("의견을 입력해 주세요.");
    record.notes.push({
      id: crypto.randomUUID(),
      serviceId: s.id,
      program: s.program,
      content: data.content,
      author: user.displayName,
      agencyId: user.agencyId || "admin",
      at: new Date().toISOString(),
    });
  } else {
    check(true);
    if (action === "private") return { name: "가상 대상자 (실제 이름 없음)" };
    if (action === "service") {
      if (data.startDate && data.endDate && data.endDate < data.startDate)
        throw Error("종료일을 확인해 주세요.");
      const s = record.services.find((s) => s.id === data.serviceId);
      Object.assign(s, {
        status: data.status,
        agencyId: data.agencyId,
        startDate: data.startDate,
        endDate: data.endDate,
      });
      record.agencyIds = [
        ...new Set(record.services.map((s) => s.agencyId).filter(Boolean)),
      ];
      record.notes.push({
        id: crypto.randomUUID(),
        program: s.program,
        content: "서비스 상태 변경: " + s.status,
        author: user.displayName,
        system: true,
        at: new Date().toISOString(),
      });
    } else if (action === "caution") record.cautions = data.content;
    else if (action === "meeting") {
      const m = { ...data, id: data.id || crypto.randomUUID() };
      const i = state.meetings.findIndex((v) => v.id === m.id);
      if (i >= 0) state.meetings[i] = m;
      else state.meetings.push(m);
    } else if (action === "agency")
      state.agencies.push({ ...data, id: crypto.randomUUID() });
    else if (action === "account") {
      if (state.accounts.some((a) => a.username === data.username))
        throw Error("이미 등록된 아이디입니다.");
      if (data.password.length < 10)
        throw Error("비밀번호는 10자리 이상으로 설정해 주세요.");
      const id = crypto.randomUUID(),
        { password, ...rest } = data;
      state.accounts.push({
        ...rest,
        id,
        active: true,
        mustChangePassword: true,
        demoHash: await digest(password + id),
      });
    } else if (action === "accountReset") {
      if (data.id === user.id)
        throw Error("본인 비밀번호는 상단 계정 메뉴에서 변경해 주세요.");
      if (data.password.length < 10)
        throw Error("비밀번호는 10자리 이상으로 설정해 주세요.");
      const a = state.accounts.find((a) => a.id === data.id);
      a.demoHash = await digest(data.password + a.id);
      a.mustChangePassword = true;
    } else if (action === "accountToggle") {
      if (data.id === user.id) throw Error("현재 계정은 중지할 수 없습니다.");
      const a = state.accounts.find((a) => a.id === data.id);
      a.active = !a.active;
    } else if (action.startsWith("sheet"))
      throw Error(
        "체험 모드에서는 실제 구글 시트에 접속하지 않습니다. 실운영 연결 후 사용할 수 있습니다.",
      );
    else throw Error("지원하지 않는 요청입니다.");
  }
  save();
  return { ok: true };
}
