import { useState } from "react";

export default function Hero({ question, onSubmitText, loading = false }) {
  const [text, setText] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    onSubmitText(text);
    setText("");
  };

  return (
    <section className="min-h-screen grid place-items-center border-b">
      <div className="container max-w-2xl">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            random-letters
          </h1>
          <p className="mt-3 text-neutral-600">
            {loading ? "Cargando pregunta…" : question}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-8 grid gap-4"
          aria-label="Formulario de respuesta"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={loading ? "Esperando pregunta activa…" : "Escribe aquí tu respuesta…"}
            disabled={loading}
            className="w-full h-32 resize-y rounded-lg border px-4 py-3 text-base outline-none focus:ring-2 focus:ring-neutral-900 disabled:bg-neutral-100 disabled:text-neutral-400"
          />

          {/* Slot para CAPTCHA (placeholder) */}
          <div className="grid gap-2">
            <div
              id="captcha-slot"
              className="h-16 rounded-lg border grid place-items-center text-xs text-neutral-500"
            >
              CAPTCHA slot — aquí integramos Turnstile/hCaptcha luego
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-md bg-black text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Esperando…" : "Enviar respuesta"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
