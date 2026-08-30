import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function RequireAdmin({ children }) {
  const { status } = useAdminAuth();

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-400">
        Memeriksa sesi login…
      </div>
    );
  }

  if (status === "anon") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
