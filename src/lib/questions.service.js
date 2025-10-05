import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const COL = "questions";

export function watchActiveQuestion(cb) {
  const q = query(collection(db, COL), where("active", "==", true));
  return onSnapshot(q, (snap) => {
    const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cb(arr[0] || null);
  });
}

export async function createQuestion({ text, period }) {
  // desactivar otras activas
  const q = query(collection(db, COL), where("active","==",true));
  const prev = await getDocs(q);
  await Promise.all(prev.docs.map(d => updateDoc(doc(db, COL, d.id), { active:false })));
  // nueva activa
  const ref = await addDoc(collection(db, COL), {
    text, period: period ?? null,
    active: true,
    createdAt: serverTimestamp()
  });
  return ref.id;
}

export async function setActiveQuestion(qid) {
  // desactiva todas y activa qid (seguro para admin)
  const q = query(collection(db, COL), where("active","==",true));
  const prev = await getDocs(q);
  await Promise.all(prev.docs.map(d => updateDoc(doc(db, COL, d.id), { active:false })));
  await updateDoc(doc(db, COL, qid), { active: true });
}
