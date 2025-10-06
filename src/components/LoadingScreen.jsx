// src/components/LoadingScreen.jsx
import { useEffect, useRef, useState } from "react";

/**
 * Fondo entra SIN fade (aparece al instante).
 * Texto entra con fade-in.
 * Salida: primero fade del texto; a mitad, empieza fade del fondo.
 * Mantiene un tiempo mínimo visible para que se note la animación.
 */
export default function LoadingScreen({
  show = false,
  minShowMs = 1200,     // tiempo mínimo visible
  textFadeMs = 900,     // duración fade del título
  bgFadeMs = 700,       // duración fade del fondo (solo al salir)
}) {
  const [textOn, setTextOn] = useState(false);
  const [bgOn, setBgOn] = useState(false);
  const [bgAnimate, setBgAnimate] = useState(true); // controla si el fondo usa transición
  const startedAtRef = useRef(null);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    if (show) {
      // ENTER
      startedAtRef.current = performance.now();
      clearTimers();
      // Fondo aparece INMEDIATO (sin transición)
      setBgAnimate(false);
      setBgOn(true);
      // Rehabilita transición del fondo para futuros cambios (salida)
      timers.current.push(setTimeout(() => setBgAnimate(true), 50));
      // Texto hace fade-in
      setTextOn(false);
      timers.current.push(setTimeout(() => setTextOn(true), 30));
      return () => {};
    }

    // EXIT — respeta minShowMs, luego fade del texto y a mitad el fondo
    const startExit = () => {
      clearTimers();
      setTextOn(false); // empieza a desvanecerse el texto
      timers.current.push(
        setTimeout(() => setBgOn(false), Math.floor(textFadeMs / 2)) // luego el fondo
      );
    };

    const elapsed = (performance.now() - (startedAtRef.current ?? performance.now()));
    const wait = Math.max(0, minShowMs - elapsed);
    timers.current.push(setTimeout(startExit, wait));

    return () => {};
  }, [show, minShowMs, textFadeMs]);

  useEffect(() => () => clearTimers(), []);

  const blockerActive = show || textOn || bgOn;

  return (
    <div
      className={`fixed inset-0 z-[9999] ${blockerActive ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={blockerActive ? "false" : "true"}
    >
      {/* Fondo blanco — sin fade-in, sí fade-out */}
      <div
        className="absolute inset-0 bg-white transition-opacity"
        style={{
          opacity: bgOn ? 1 : 0,
          transitionDuration: bgAnimate ? `${bgFadeMs}ms` : "0ms",
        }}
      />

      {/* Título con fades */}
      <div className="relative h-full grid place-items-center">
        <h1
          className="text-3xl md:text-5xl font-semibold tracking-tight transition-opacity"
          style={{
            opacity: textOn ? 1 : 0,
            transitionDuration: `${textFadeMs}ms`,
          }}
        >
          random-letters
        </h1>
      </div>
    </div>
  );
}
