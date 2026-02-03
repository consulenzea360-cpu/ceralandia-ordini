// FILE: src/hooks/useAuth.js
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

const LOCAL_USERS = ["ambra", "salvo", "franco", "ignazio", "alessandro"];
const LOCAL_PASSWORD = "Ceralandia!2025";

// ✅ chiave dedicata SOLO per gli utenti locali
const LOCAL_USER_KEY = "ceralandia_local_user_v1";

export function useAuth() {
  // ✅ re-hydrate immediato: così con F5 l'utente locale resta loggato
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_USER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // forma minima attesa: { username, role: "user" }
      if (parsed?.username && parsed?.role === "user") return parsed;
      return null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Controlla eventuale sessione admin Supabase
  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // ✅ se c'è admin, prevale sempre su locale
        setUser({
          username: "admin",
          role: "admin",
          supabaseUser: session.user,
        });
      }

      setLoading(false);
    }

    loadSession();

    // Listener sessione Supabase
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // admin autenticato tramite Supabase
        setUser({
          username: "admin",
          role: "admin",
          supabaseUser: session.user,
        });
      }

      // ❗ IMPORTANTE:
      // NON aggiungere else { setUser(null) }
      // Altrimenti gli utenti locali verrebbero sloggati
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Login locale
  function loginLocal(username, password) {
    const u = (username || "").trim().toLowerCase();

    if (LOCAL_USERS.includes(u) && password === LOCAL_PASSWORD) {
      const localUser = { username: u, role: "user" };
      setUser(localUser);
      // ✅ persistenza
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
      return true;
    }
    return false;
  }

  // Login admin da Supabase (lo lasciamo com'è)
  function loginAdmin(adminUser) {
    // ✅ se entra admin, puliamo eventuale locale salvato
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser({ username: "admin", role: "admin", supabaseUser: adminUser });
  }

  async function logout() {
    // ✅ se sei admin fai signOut supabase, se sei locale no
    if (user?.role === "admin") {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
  }

  return { user, loginLocal, loginAdmin, logout, loading };
}
