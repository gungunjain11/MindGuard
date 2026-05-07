import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";
import { app } from "./config";

export const db = getFirestore(app);

export async function saveUserProfile(uid: string, data: Record<string, unknown>) {
  await setDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function createCheckin(uid: string, data: Record<string, unknown>) {
  return addDoc(collection(db, "users", uid, "checkins"), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function createJournal(uid: string, data: Record<string, unknown>) {
  return addDoc(collection(db, "users", uid, "journals"), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function getRecentCheckins(uid: string) {
  const q = query(collection(db, "users", uid, "checkins"), orderBy("createdAt", "desc"), limit(10));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getRecentInsights(uid: string) {
  const q = query(collection(db, "users", uid, "insights"), orderBy("createdAt", "desc"), limit(5));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getRecentWeeklyReviews(uid: string) {
  const q = query(collection(db, "users", uid, "weeklyReviews"), orderBy("createdAt", "desc"), limit(3));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
