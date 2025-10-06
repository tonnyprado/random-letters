import { useEffect, useState } from "react";
import Hero from "./components/Hero.jsx";
import Responses from "./components/Responses.jsx";
import Footer from "./components/Footer.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";

import { watchActiveQuestion } from "./lib/questions.service";
import { watchResponsesByQuestion, createResponse } from "./lib/responses.service";

export default function App() {
  const [activeQ, setActiveQ] = useState(null);
  const [responses, setResponses] = useState([]);
  const [booting, setBooting] = useState(true); // <- controla el overlay

  // Pregunta activa
  useEffect(() => {
    const stop = watchActiveQuestion((q) => {
      setActiveQ(q);       // q puede ser objeto o null
      setBooting(false);   // ya cargó el snapshot => ocultar overlay
    });
    return () => stop?.();
  }, []);

  // Respuestas ligadas a la pregunta actual
  useEffect(() => {
    if (!activeQ?.id) { setResponses([]); return; }
    const stop = watchResponsesByQuestion(activeQ.id, setResponses);
    return () => stop?.();
  }, [activeQ?.id]);

  const handleSubmitText = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || !activeQ?.id) return;
    await createResponse({ text: trimmed, questionId: activeQ.id });
    document.getElementById("responses")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-dvh flex flex-col bg-white text-neutral-900">
      {/* Overlay de carga con fade-out */}
      <LoadingScreen show={booting} />

      <main className="flex-1">
        <Hero
          question={activeQ?.text ?? "…"}
          loading={booting}
          onSubmitText={handleSubmitText}
        />
        <Responses items={responses} />
      </main>
      <Footer />
    </div>
  );
}
