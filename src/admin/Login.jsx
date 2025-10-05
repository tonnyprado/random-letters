import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const auth = getAuth(app); // inicializa Auth SOLO aquí
      await signInWithEmailAndPassword(auth, email, pass);
      window.location.href = "/admin";
    } catch (e) {
      setErr(e.message || "Error de inicio de sesión");
    }
  };

  return (
    <section className="min-h-screen grid place-items-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm border rounded-lg p-6 bg-white">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <div className="mt-4 grid gap-3">
          <input className="border rounded-md px-3 py-2" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="border rounded-md px-3 py-2" type="password" placeholder="Password" value={pass} onChange={(e)=>setPass(e.target.value)} />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className="mt-2 px-4 py-2 rounded-md bg-black text-white">Entrar</button>
        </div>
      </form>
    </section>
  );
}
