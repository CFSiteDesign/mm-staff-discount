import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getDB, saveDB, logActivity, type StaffPass } from "@/lib/db";

interface RegistrationProps {
  onPassCreated: (pass: StaffPass) => void;
  onExistingPass: (pass: StaffPass) => void;
  onAdminClick: () => void;
}

export default function Registration({ onPassCreated, onExistingPass, onAdminClick }: RegistrationProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [emailError, setEmailError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("File too large (Max 5MB)");
      return;
    }
    setPhotoError("");
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPhotoError("");

    if (!photo) { setPhotoError("Photo is required"); return; }

    const domain = email.toLowerCase().split("@")[1];
    const db = getDB();

    if (!db.approvedDomains.includes(domain)) {
      setEmailError("This email domain is not authorised.");
      return;
    }

    const existing = db.passes.find(p => p.email === email.toLowerCase() && p.status === "active");
    if (existing) {
      onExistingPass(existing);
      return;
    }

    const firstName = fullName.split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "");
    const domainClean = domain.split(".")[0].toUpperCase().replace(/[^A-Z]/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${firstName}-${domainClean}-${rand}`;

    const newPass: StaffPass = {
      id: Date.now().toString(),
      fullName,
      email: email.toLowerCase(),
      photo,
      code,
      dateIssued: new Date().toISOString(),
      status: "active",
      revokeReason: null,
    };

    db.passes.push(newPass);
    saveDB(db);
    logActivity("pass_issued", `Pass issued to ${fullName} (${email})`);
    onPassCreated(newPass);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-black text-primary text-center mb-6 tracking-tight">
          🐒 MAD MONKEY
        </h1>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <h2 className="font-display text-xl font-bold text-center mb-5">Staff Discount Pass</h2>
            <form onSubmit={handleSubmit}>
              {/* Photo upload */}
              <div className="flex flex-col items-center mb-5">
                <div
                  className="w-28 h-28 rounded-full border-[3px] border-primary bg-muted flex items-center justify-center overflow-hidden mb-3 cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                >
                  {photo ? (
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhoto} />
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  Select Photo
                </Button>
                {photoError && <p className="text-destructive text-xs mt-1">{photoError}</p>}
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Sarah Jones" required />
                </div>
                <div>
                  <Label>Company Email</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@madmonkeyhostels.com" required />
                  {emailError && <p className="text-destructive text-xs mt-1">{emailError}</p>}
                </div>
                <Button type="submit" className="w-full" size="lg">Verify & Generate Pass</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <p className="text-center mt-8">
          <button onClick={onAdminClick} className="text-muted-foreground text-xs hover:text-primary transition-colors">
            Admin Login
          </button>
        </p>
      </div>
    </div>
  );
}
