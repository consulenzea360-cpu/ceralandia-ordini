// FILE: src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  function submit(e) {
    e.preventDefault();
    const ok = onLogin(username, password);
    if (ok) {
      nav("/"); // vai alla home vera
    } else {
      setErr("Credenziali non valide");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={submit}
        className="w-96 bg-white p-6 rounded-xl shadow"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          Ceralandia – Login
        </h1>

        <label className="block mb-2">Nome utente</label>
        <input
          className="w-full p-2 border rounded mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ambra / Riccardo"
        />

        <label className="block mb-2">Password</label>
        <input
          type="password"
          className="w-full p-2 border rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        {err && <div className="text-red-500 mb-2">{err}</div>}

        <button className="w-full py-2 bg-blue-600 text-white rounded">
          Accedi
        </button>
      </form>
    </div>
  );
}
