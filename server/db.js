import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
export function db() {
  if (!getApps().length) {
    const {
      FIREBASE_PROJECT_ID: projectId,
      FIREBASE_CLIENT_EMAIL: clientEmail,
      FIREBASE_PRIVATE_KEY: privateKey,
    } = process.env;
    if (!projectId || !clientEmail || !privateKey)
      throw Object.assign(new Error("Firebase 서버 연결 설정이 필요합니다."), {
        status: 503,
      });
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}
