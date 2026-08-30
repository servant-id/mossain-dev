import { createContext, useContext, useEffect, useState } from "react";
import { adminVerify, adminLogout as doLogout, getStoredToken } from "../lib/adminApi";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [status, setStatus] = useState("checking"); // checking | authed | anon
  const [username, setUsername] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!getStoredToken()) {
      setStatus("anon");
      return;
    }
    adminVerify()
      .then((res) => {
        if (cancelled) return;
        if (res.valid) {
          setUsername(res.username);
          setStatus("authed");
        } else {
          setStatus("anon");
        }
      })
      .catch(() => !cancelled && setStatus("anon"));
    return () => { cancelled = true; };
  }, []);

  function markAuthed(name) {
    setUsername(name);
    setStatus("authed");
  }

  function logout() {
    doLogout();
    setUsername(null);
    setStatus("anon");
  }

  return (
    <AdminAuthContext.Provider value={{ status, username, markAuthed, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
