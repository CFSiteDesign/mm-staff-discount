import { useState, useCallback } from "react";
import Registration from "@/components/Registration";
import VerificationAnimation from "@/components/VerificationAnimation";
import CheckEmail from "@/components/CheckEmail";
import type { StaffPass } from "@/lib/db";

type View = "register" | "verify" | "pass";

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

  return (
    <>
      {view === "register" && (
        <Registration onPassCreated={handlePassCreated} onExistingPass={handleExistingPass} />
      )}
      {view === "verify" && <VerificationAnimation onComplete={handleVerifyComplete} />}
      {view === "pass" && currentPass && <CheckEmail email={currentPass.email} />}
    </>
  );
}
