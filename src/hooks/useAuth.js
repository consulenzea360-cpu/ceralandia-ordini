// FILE: src/hooks/useAuth.js
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

const LOCAL_USERS = ["ambra", "salvo", "franco", "ignazio", "alessandro"];
const LOCAL_PASSWORD = "Ceralandia!2025";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Controlla eventuale sessione admin Supabase
  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
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
const { data: listener } = supabase.auth.onAuthStateChange(
  (_event, session) => {
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
  }
);


    return () => listener.subscription.unsubscribe();
  }, []);

  // Login locale o admin
  function loginLocal(username, password) {
    if (LOCAL_USERS.includes(username.toLowerCase()) && password === LOCAL_PASSWORD) {
      setUser({ username, role: "user" });
      return true;
    }
    return false;
  }

  // Login admin da Supabase
  function loginAdmin(adminUser) {
    setUser({ username: "admin", role: "admin", supabaseUser: adminUser });
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return { user, loginLocal, loginAdmin, logout, loading };
}
