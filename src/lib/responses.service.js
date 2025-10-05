import {
  collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot,
  doc, updateDoc, increment, writeBatch, getDocs
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "responses";

export function watchResponsesByQuestion(questionId, cb) {
  if (!questionId) return () => {};
  const q = query(
    collection(db, COL),
    where("questionId", "==", questionId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cb(items);
  });
}

export async function createResponse({ text, questionId }) {
  return addDoc(collection(db, COL), {
    text,
    createdAt: serverTimestamp(),
    questionId,
    reactions: { like: 0, sad: 0, angry: 0, relate: 0 },
  });
}

export async function reactToResponse(id, type) {
  await updateDoc(doc(db, COL, id), { [`reactions.${type}`]: increment(1) });
}

// Admin helpers
export async function deleteAllByQuestion(questionId) {
  const q = query(collection(db, COL), where("questionId","==",questionId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

export async function deleteSelected(ids = []) {
  const batch = writeBatch(db);
  ids.forEach(id => batch.delete(doc(db, COL, id)));
  await batch.commit();
}
