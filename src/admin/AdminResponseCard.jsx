import { Heart, Frown, Angry, Sparkles } from "lucide-react";

export default function AdminResponseCard({ item, selected, onToggle }) {
  const date = item.createdAt?.toDate ? item.createdAt.toDate() : new Date();
  const when = new Intl.DateTimeFormat("es-MX",{ dateStyle:"medium", timeStyle:"short"}).format(date);
  const r = item.reactions || {};

  return (
    <article className={`rounded-lg border p-5 bg-white relative ${selected ? "ring-2 ring-black" : ""}`}>
      <label className="absolute top-3 right-3 inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={selected} onChange={onToggle} className="w-4 h-4" />
        Seleccionar
      </label>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.text}</p>
      <div className="mt-4 text-xs text-neutral-500">Publicado: {when}</div>

      <div className="mt-3 flex gap-3 text-neutral-500 text-sm">
        <span className="inline-flex items-center gap-1"><Frown size={16}/> {r.sad ?? 0}</span>
        <span className="inline-flex items-center gap-1"><Heart size={16}/> {r.like ?? 0}</span>
        <span className="inline-flex items-center gap-1"><Angry size={16}/> {r.angry ?? 0}</span>
        <span className="inline-flex items-center gap-1"><Sparkles size={16}/> {r.relate ?? 0}</span>
      </div>
      <div className="mt-2 text-xs text-neutral-500">Pregunta: {item.questionId}</div>
    </article>
  );
}
