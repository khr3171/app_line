import { GoogleAuth } from "google-auth-library";
import { db } from "./db.js";
import { assert, hash, normalizeRows } from "./domain.js";
async function google(path) {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const token = await auth.getAccessToken();
  const response = await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets/" +
      encodeURIComponent(process.env.GOOGLE_SHEET_ID) +
      path,
    { headers: { Authorization: "Bearer " + token } },
  );
  assert(response.ok, "구글 시트 권한 또는 API 설정을 확인해 주세요.", 502);
  return response.json();
}
export async function sheetRows() {
  assert(process.env.GOOGLE_SHEET_ID, "시트 ID 설정이 필요합니다.", 503);
  const meta = await google("?fields=sheets(properties)");
  const sheet = meta.sheets.find(
    (s) =>
      String(s.properties.sheetId) ===
      String(process.env.GOOGLE_SHEET_GID || "1209279667"),
  );
  assert(sheet, "지정한 시트 탭을 찾지 못했습니다.");
  const range = "'" + sheet.properties.title.replace(/'/g, "''") + "'!A:ZZ";
  const data = await google(
    "/values/" +
      encodeURIComponent(range) +
      "?valueRenderOption=FORMATTED_VALUE",
  );
  return data.values || [];
}
export async function preview(mapping) {
  const rows = await sheetRows();
  const result = normalizeRows(rows, mapping);
  return {
    valid: result.records.length,
    errors: result.errors,
    headers: rows[0] || [],
    sample: result.records
      .slice(0, 5)
      .map(({ birth, group, programs }) => ({ birth, group, programs })),
  };
}
export async function syncSheet(actor = "sheet-trigger") {
  const store = db();
  const settings = (await store.doc("settings/sheets").get()).data();
  assert(settings?.mapping, "먼저 시트 열 연결을 저장해 주세요.");
  // Lease serializes manual and form-triggered imports. Never delete absent rows.
  const lock = store.doc("system/sheetLock");
  await store.runTransaction(async (tx) => {
    const snap = await tx.get(lock);
    assert(
      !snap.exists || snap.data().until < Date.now(),
      "다른 동기화가 진행 중입니다.",
      409,
    );
    tx.set(lock, { until: Date.now() + 300000 });
  });
  try {
    const { records, errors } = normalizeRows(
      await sheetRows(),
      settings.mapping,
    );
    assert(
      !errors.length,
      "시트 검증 오류가 있습니다. 미리보기에서 오류 행을 수정해 주세요.",
    );
    let created = 0,
      updated = 0;
    for (const input of records) {
      const id = hash(process.env.GOOGLE_SHEET_ID + ":" + input.sourceId).slice(
        0,
        24,
      );
      const ref = store.doc("cases/" + id);
      const { sourceId, programs, ...demographics } = input;
      await store.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const old = snap.data();
        const services = old?.services || [];
        for (const program of programs)
          if (!services.some((s) => s.program === program))
            services.push({
              id: hash(id + program).slice(0, 12),
              program,
              status: "접수",
              agencyId: "",
              startDate: "",
              endDate: "",
            });
        const { name, ...safeDemographics } = demographics;
        const data = {
          ...safeDemographics,
          services,
          updatedAt: new Date().toISOString(),
        };
        if (!snap.exists) {
          Object.assign(data, {
            id,
            reference: "접수-" + id.slice(0, 6).toUpperCase(),
            agencyIds: [],
            notes: [],
            cautions: "",
            createdAt: new Date().toISOString(),
          });
          created++;
        } else updated++;
        tx.set(ref, data, { merge: true });
        tx.set(
          store.doc("privateCases/" + id),
          { name: input.name || "" },
          { merge: true },
        );
      });
    }
    await store
      .doc("settings/sheets")
      .set(
        { lastSyncedAt: new Date().toISOString(), lastCount: records.length },
        { merge: true },
      );
    await store
      .collection("audit")
      .add({
        actor,
        action: "sheet.sync",
        created,
        updated,
        at: new Date().toISOString(),
      });
    return { created, updated };
  } finally {
    await lock.delete();
  }
}
