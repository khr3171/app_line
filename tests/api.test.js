import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import handler from "../api/index.js";
async function request(action, { method = "GET", origin, body } = {}) {
  const req = Readable.from(body ? [JSON.stringify(body)] : []);
  req.method = method;
  req.url = "/api?action=" + action;
  req.headers = { ...(origin ? { origin } : {}) };
  const headers = {};
  let payload;
  const res = {
    setHeader(k, v) {
      headers[k] = v;
    },
    end(v) {
      payload = JSON.parse(v);
    },
  };
  await handler(req, res);
  return { status: res.statusCode, headers, payload };
}
test("로그인 없는 데이터 요청은 401, no-store", async () => {
  const r = await request("state");
  assert.equal(r.status, 401);
  assert.equal(r.headers["Cache-Control"], "no-store");
});
test("CSRF 다른 Origin 쓰기는 403", async () => {
  process.env.APP_ORIGIN = "https://test.example";
  const r = await request("login", {
    method: "POST",
    origin: "https://evil.example",
    body: { username: "test" },
  });
  assert.equal(r.status, 403);
});
test("인증없는 webhook은 거부", async () => {
  const r = await request("webhook", { method: "POST", body: {} });
  assert.equal(r.status, 401);
});
test("GET으로 로그인 호출 거부", async () => {
  assert.equal((await request("login")).status, 405);
});
test("불필요한 HTTP 메서드 거부", async () => {
  assert.equal((await request("state", { method: "DELETE" })).status, 405);
});
