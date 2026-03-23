import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/mad-monkey-logo.png";

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

export default function AdminLogin({ onLogin, onBack }: Props) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === "111111") {
      sessionStorage.setItem("adminAuth", "true");
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 bg-secondary">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src={logo}
          alt="Mad Monkey"
          className="h-14 mx-auto mb-8 invert"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        />
        <Card className="shadow-pass">
          <CardContent className="pt-6">
            <h2 className="font-display text-xl font-bold text-center mb-5">Admin Access</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Password</Label>
                <Input type="password" value={pwd} onChange={e => { setPwd(e.target.value); setError(false); }} required />
                {error && <p className="text-destructive text-xs mt-1">Incorrect password.</p>}
              </div>
              <Button type="submit" className="w-full" size="lg">Login</Button>
              <Button type="button" variant="outline" className="w-full" size="lg" onClick={onBack}>Back to Home</Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
