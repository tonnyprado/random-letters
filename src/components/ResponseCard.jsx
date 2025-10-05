import { useState } from "react";
import { Heart, Frown, Angry, Sparkles } from "lucide-react";
import { reactToResponse } from "../lib/responses.service";

export default function ResponseCard({ item }) {
  // refleja en UI sin esperar el roundtrip (optimista)
  const [local, setLocal] = useState(item.reactions || { like:0, sad:0, angry:0, relate:0 });

  const handle = async (type) => {
    setLocal((p) => ({ ...p, [type]: (p?.[type] || 0) + 1 }));
    try { await reactToResponse(item.id, type); } catch {}
  };

  const date = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt || Date.now());
  const when = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(date);

  return (
    <article className="rounded-lg border p-5 bg-white hover:shadow-sm transition">
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.text}</p>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-neutral-500">Publicado: {when}</span>
        <div className="flex gap-3 text-neutral-500">
          <button type="button" onClick={() => handle("sad")}    className="flex items-center gap-1 hover:text-blue-600 transition">
            <Frown size={16} /> {local.sad || ""}
          </button>
          <button type="button" onClick={() => handle("like")}   className="flex items-center gap-1 hover:text-pink-600 transition">
            <Heart size={16} /> {local.like || ""}
          </button>
          <button type="button" onClick={() => handle("angry")}  className="flex items-center gap-1 hover:text-red-600 transition">
            <Angry size={16} /> {local.angry || ""}
          </button>
          <button type="button" onClick={() => handle("relate")} className="flex items-center gap-1 hover:text-amber-600 transition">
            <Sparkles size={16} /> {local.relate || ""}
          </button>
        </div>
      </div>
    </article>
  );
}
