import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/mad-monkey-logo.png";

const steps = [
  { id: 1, text: "Employee record found" },
  { id: 2, text: "Credentials verified" },
  { id: 3, text: "Discount eligibility confirmed" },
];

interface Props {
  onComplete: () => void;
}

export default function VerificationAnimation({ onComplete }: Props) {
  const [phase, setPhase] = useState<"connecting" | "progress" | "checklist" | "success">("connecting");
  const [visibleChecks, setVisibleChecks] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => { setPhase("progress"); setTimeout(() => setProgress(100), 50); }, 1500);
    const t2 = setTimeout(() => { setPhase("checklist"); }, 3000);
    const t3 = setTimeout(() => setVisibleChecks(1), 3200);
    const t4 = setTimeout(() => setVisibleChecks(2), 3600);
    const t5 = setTimeout(() => setVisibleChecks(3), 4000);
    const t6 = setTimeout(() => setPhase("success"), 4500);
    const t7 = setTimeout(onComplete, 5500);
    return () => [t1, t2, t3, t4, t5, t6, t7].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="flex min-h-screen items-center justify-center px-5 bg-secondary">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src={logo}
          alt="Mad Monkey"
          className="h-14 mx-auto mb-6 invert"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        />
        <Card className="shadow-pass">
          <CardContent className="pt-8 pb-8 text-center">
            <AnimatePresence mode="wait">
              {phase !== "success" ? (
                <motion.div
                  key="spinner"
                  className="w-14 h-14 border-[5px] border-muted border-t-primary rounded-full mx-auto mb-5"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              ) : (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-16 h-16 rounded-full bg-success flex items-center justify-center mx-auto mb-5"
                >
                  <Check className="w-8 h-8 text-success-foreground" />
                </motion.div>
              )}
            </AnimatePresence>

            <h3 className="font-display font-bold text-lg mb-4">
              {phase === "connecting" && "Connecting to Mad Monkey Network..."}
              {phase === "progress" && "Verifying employee credentials..."}
              {phase === "checklist" && "Checking database..."}
              {phase === "success" && "✓ Verification Complete"}
            </h3>

            {phase === "progress" && (
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-[1500ms] ease-in-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {phase === "checklist" && (
              <div className="text-left max-w-[220px] mx-auto space-y-2">
                {steps.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={i < visibleChecks ? { opacity: 1, x: 0 } : {}}
                    className="flex items-center gap-2 font-medium text-sm"
                  >
                    <span className="text-success font-bold">✓</span>
                    {s.text}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
