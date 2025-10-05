import ResponseCard from "./ResponseCard.jsx";

export default function Responses({ items }) {
  return (
    <section id="responses" className="border-b">
      <div className="container py-14">
        <h2 className="text-2xl font-semibold">Responses</h2>
        {items.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600">
            Aún no hay respuestas. Escribe la primera arriba ✨
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <ResponseCard key={it.id} item={it} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
