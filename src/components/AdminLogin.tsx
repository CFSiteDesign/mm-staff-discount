import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

export default function AdminLogin({ onLogin, onBack }: Props) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === "madmonkey2026") {
      sessionStorage.setItem("adminAuth", "true");
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-black text-primary text-center mb-6 tracking-tight">
          🐒 MAD MONKEY
        </h1>
        <Card className="shadow-card">
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
      </div>
    </div>
  );
}
