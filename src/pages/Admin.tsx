import { useState } from "react";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

export default function Admin() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("adminAuth") === "true"
  );

  const handleLogin = () => setAuthed(true);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setAuthed(false);
  };

  if (!authed) {
    return <AdminLogin onLogin={handleLogin} onBack={() => window.location.href = "/"} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
