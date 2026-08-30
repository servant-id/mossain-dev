import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { adminLogout as doLogout } from "../lib/adminApi";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [status, setStatus] = useState("checking"); // checking | authed | anon
  const [email, setEmail] = useState(null);

  useEffect(() => {
    // Cek sesi yang sudah tersimpan (localStorage) saat app pertama dibuka.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setEmail(data.session.user.email);
        setStatus("authed");
      } else {
        setStatus("anon");
      }
    });

    // Dengarkan perubahan sesi (login/logout/token refresh) — otomatis
    // dari Supabase, tidak perlu polling atau verifikasi manual.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setEmail(session.user.email);
        setStatus("authed");
      } else {
        setEmail(null);
        setStatus("anon");
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await doLogout();
  }

  return (
    <AdminAuthContext.Provider value={{ status, username: email, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
