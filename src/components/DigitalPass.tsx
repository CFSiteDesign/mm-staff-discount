import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getTimeRemaining, type StaffPass } from "@/lib/db";
import logo from "@/assets/mad-monkey-logo.png";

interface Props {
  pass: StaffPass;
  onReset: () => void;
}

export default function DigitalPass({ pass, onReset }: Props) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(pass));
  const date = new Date(pass.dateIssued);
  const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(pass));
    }, 1000);
    return () => clearInterval(interval);
  }, [pass]);

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10 bg-primary">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Pass Card */}
        <motion.div
          className="bg-card rounded-2xl overflow-hidden shadow-pass border-t-[6px] border-secondary text-center p-8 mb-5"
          initial={{ rotateY: 90 }}
          animate={{ rotateY: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        >
          <img src={logo} alt="Mad Monkey" className="h-12 mx-auto mb-4" />
          <motion.span
            className="inline-block bg-secondary text-secondary-foreground text-xs font-bold tracking-widest px-3 py-1.5 rounded-full mb-5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            CERTIFIED STAFF
          </motion.span>
          <motion.img
            src={pass.photo}
            alt={pass.fullName}
            className="w-32 h-32 rounded-full border-4 border-primary mx-auto mb-4 object-cover"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          />
          <h2 className="font-display text-2xl font-black uppercase mb-1">{pass.fullName}</h2>
          <p className="text-muted-foreground text-sm mb-6">{pass.email}</p>

          {timeLeft.expired ? (
            <motion.div
              className="bg-destructive/10 border-2 border-destructive text-destructive py-4 px-5 rounded-lg text-lg font-black mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              PASS EXPIRED
            </motion.div>
          ) : (
            <motion.div
              className="bg-primary text-primary-foreground py-4 px-5 rounded-lg text-xl font-black -rotate-2 shadow-primary-glow mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              50% FOOD & BEVERAGE
            </motion.div>
          )}

          {/* Countdown timer */}
          <div className={`rounded-lg p-3 mb-4 text-center ${timeLeft.expired ? "bg-destructive/10" : "bg-accent"}`}>
            <p className="text-xs text-muted-foreground mb-1">TIME REMAINING</p>
            <p className={`font-mono text-2xl font-bold tracking-wider ${timeLeft.expired ? "text-destructive" : ""}`}>
              {timeLeft.expired
                ? "00:00:00"
                : `${String(timeLeft.hours).padStart(2, "0")}:${String(timeLeft.minutes).padStart(2, "0")}:${String(timeLeft.seconds).padStart(2, "0")}`}
            </p>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-3 mb-4">
            <p className="text-xs text-muted-foreground mb-1">UNIQUE VERIFICATION CODE</p>
            <p className="font-mono text-lg font-bold tracking-wider">{pass.code}</p>
          </div>

          <p className="text-xs text-muted-foreground">
            Issued: {dateStr} · Expires: {new Date(pass.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            <br />Valid at all Mad Monkey locations worldwide
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          <Button size="lg" variant={timeLeft.expired ? "default" : "outline"} className={`w-full ${timeLeft.expired ? "" : "bg-card"}`} onClick={onReset}>
            Generate New Pass
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
