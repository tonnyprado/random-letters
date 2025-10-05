import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut, getIdTokenResult } from "firebase/auth";
import { app } from "../lib/firebase";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("loading");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setStatus("noauth"); setIsAdmin(false); return; }
      const token = await getIdTokenResult(u, true);
      const admin = token.claims?.admin === true;
      setIsAdmin(admin);
      setStatus(admin ? "ok" : "forbidden");
    });
    return () => unsub();
  }, []);

  if (status === "loading") return <div className="p-8">Cargando…</div>;
  if (status === "noauth") { window.location.href = "/login"; return null; }
  if (status === "forbidden") return (
    <div className="p-8">
      Acceso denegado.
      <button className="ml-3 underline" onClick={() => signOut(getAuth(app)).then(()=>location.href="/login")}>Salir</button>
    </div>
  );
  return children;
}
