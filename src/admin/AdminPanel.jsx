import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app, db } from "../lib/firebase";
import { watchResponsesByQuestion, deleteAllByQuestion, deleteSelected } from "../lib/responses.service";
import { setActiveQuestion, createQuestion } from "../lib/questions.service";
import * as XLSX from "xlsx";
import AdminResponseCard from "./AdminResponseCard.jsx";

export default function AdminPanel() {
  const [questions, setQuestions] = useState([]);
  const [active, setActive] = useState(null);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [userEmail, setUserEmail] = useState("");

  // Lee el usuario actual para mostrar su email
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (u) => setUserEmail(u?.email || ""));
    return () => unsub();
  }, []);

  // Cargar preguntas
  useEffect(() => {
    const q = query(collection(db, "questions"), orderBy("createdAt","desc"));
    return onSnapshot(q, (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setQuestions(arr);
      setActive(arr.find(x => x.active) || null);
    });
  }, []);

  // Cargar responses de la pregunta elegida (por defecto la activa)
  const currentQ = active?.id ?? questions[0]?.id ?? null;
  useEffect(() => {
    if (!currentQ) return;
    const stop = watchResponsesByQuestion(currentQ, setItems);
    return () => stop?.();
  }, [currentQ]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  const exportExcel = () => {
    const rows = items
      .filter(it => selected.size === 0 || selected.has(it.id))
      .map(it => ({
        id: it.id,
        questionId: it.questionId,
        text: it.text,
        createdAt: it.createdAt?.toDate ? it.createdAt.toDate().toISOString() : "",
        like: it.reactions?.like ?? 0,
        sad: it.reactions?.sad ?? 0,
        angry: it.reactions?.angry ?? 0,
        relate: it.reactions?.relate ?? 0,
      }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "responses");
    XLSX.writeFile(wb, "responses.xlsx");
  };

  const deleteAll = async () => {
    if (!currentQ) return;
    if (!confirm("¿Eliminar TODAS las respuestas de esta pregunta?")) return;
    await deleteAllByQuestion(currentQ);
    clearSelection();
  };

  const deleteSel = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`¿Eliminar ${ids.length} seleccionadas?`)) return;
    await deleteSelected(ids);
    clearSelection();
  };

  const [newQ, setNewQ] = useState("");
  const createNewQuestion = async () => {
    const t = newQ.trim();
    if (!t) return;
    await createQuestion({ text: t });
    setNewQ("");
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth(app));
      window.location.href = "/login";
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
      alert("No se pudo cerrar sesión. Intenta de nuevo.");
    }
  };

  return (
    <div className="min-h-dvh bg-white text-neutral-900">
      <header className="border-b">
        <div className="container py-4 flex flex-wrap items-center gap-3 justify-between">
          <h1 className="text-xl font-semibold">Admin Panel</h1>

          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-600">
              {userEmail ? `Conectado: ${userEmail}` : "—"}
            </span>
            <button
              className="px-3 py-2 rounded-md border hover:bg-neutral-50"
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="container pb-4">
          <div className="flex items-center gap-2">
            <input
              className="border rounded-md px-3 py-2 w-64"
              placeholder="Nueva pregunta…"
              value={newQ}
              onChange={(e)=>setNewQ(e.target.value)}
            />
            <button className="px-3 py-2 rounded-md bg-black text-white" onClick={createNewQuestion}>
              Crear & Activar
            </button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Selector de pregunta */}
        <div className="flex flex-wrap items-center gap-2">
          {questions.map(q => (
            <button
              key={q.id}
              className={`px-3 py-1.5 rounded-md border ${q.id === currentQ ? "bg-black text-white" : "bg-white"}`}
              onClick={() => setActive(q)}
              title={q.text}
            >
              {q.active ? "⭐︎ " : ""}{q.text.slice(0, 24)}{q.text.length>24?"…":""}
            </button>
          ))}
          {active && (
            <button
              className="ml-2 px-3 py-1.5 rounded-md border"
              onClick={() => setActive(questions.find(x=>x.id===active.id))}
              disabled
            >
              Activa
            </button>
          )}
        </div>

        {/* Acciones */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="px-3 py-2 rounded-md border" onClick={exportExcel}>Descargar Excel</button>
          <button className="px-3 py-2 rounded-md border" onClick={deleteSel} disabled={selected.size===0}>
            Eliminar seleccionadas ({selected.size})
          </button>
          <button className="px-3 py-2 rounded-md border border-red-500 text-red-600" onClick={deleteAll}>
            Eliminar TODAS de esta pregunta
          </button>
        </div>

        {/* Lista */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map(it => (
            <AdminResponseCard
              key={it.id}
              item={it}
              selected={selected.has(it.id)}
              onToggle={()=>toggleSelect(it.id)}
            />
          ))}
          {items.length===0 && <p className="text-sm text-neutral-600">Sin respuestas para esta pregunta.</p>}
        </div>
      </main>
    </div>
  );
}
