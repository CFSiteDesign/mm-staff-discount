import { useState, useCallback } from "react";
import Registration from "@/components/Registration";
import VerificationAnimation from "@/components/VerificationAnimation";
import DigitalPass from "@/components/DigitalPass";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";
import type { StaffPass } from "@/lib/db";

type View = "register" | "verify" | "pass" | "admin-login" | "admin-dash";

export default function Index() {
  const [view, setView] = useState<View>("register");
  const [currentPass, setCurrentPass] = useState<StaffPass | null>(null);

  const handlePassCreated = (pass: StaffPass) => {
    setCurrentPass(pass);
    setView("verify");
  };

  const handleVerifyComplete = useCallback(() => {
    setView("pass");
  }, []);

  const handleExistingPass = (pass: StaffPass) => {
    setCurrentPass(pass);
    setView("pass");
  };

  const handleReset = () => {
    setCurrentPass(null);
    setView("register");
  };

  const handleAdminLogin = () => {
    setView("admin-dash");
  };

  return (
    <>
      {view === "register" && (
        <Registration onPassCreated={handlePassCreated} onExistingPass={handleExistingPass} onAdminClick={() => setView("admin-login")} />
      )}
      {view === "verify" && <VerificationAnimation onComplete={handleVerifyComplete} />}
      {view === "pass" && currentPass && <DigitalPass pass={currentPass} onReset={handleReset} />}
      {view === "admin-login" && <AdminLogin onLogin={handleAdminLogin} onBack={handleReset} />}
      {view === "admin-dash" && <AdminDashboard onLogout={handleReset} />}
    </>
  );
}
