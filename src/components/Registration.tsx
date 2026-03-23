import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getApprovedDomains, insertPass, logActivity, isPassExpired, fetchPasses, type StaffPass } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/mad-monkey-logo.png";

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
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPhotoError("");

    if (!photo) { setPhotoError("A photo of your face is required"); return; }

    const domain = email.toLowerCase().split("@")[1];
    const approvedDomains = getApprovedDomains();

    if (!approvedDomains.includes(domain)) {
      setEmailError("This email domain is not authorised.");
      return;
    }

    setLoading(true);

    // Check for existing active pass in database
    const passes = await fetchPasses();
    const existing = passes.find(p => p.email === email.toLowerCase() && p.status === "active" && !isPassExpired(p));
    if (existing) {
      setLoading(false);
      onExistingPass(existing);
      return;
    }

    const firstName = fullName.split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "");
    const domainClean = domain.split(".")[0].toUpperCase().replace(/[^A-Z]/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${firstName}-${domainClean}-${rand}`;

    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    // Upload photo to storage
    let photoUrl = "";
    try {
      const base64Data = photo.split(",")[1];
      const mimeType = photo.split(";")[0].split(":")[1];
      const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
      const byteArray = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const fileName = `${code.toLowerCase()}.${ext}`;

      await supabase.storage.from("pass-photos").upload(fileName, byteArray, {
        contentType: mimeType,
        upsert: true,
      });

      const { data: urlData } = supabase.storage.from("pass-photos").getPublicUrl(fileName);
      photoUrl = urlData.publicUrl;
    } catch (err) {
      console.error("Photo upload failed:", err);
    }

    const newPass: StaffPass = {
      id: Date.now().toString(),
      fullName,
      email: email.toLowerCase(),
      photo,
      photoUrl,
      code,
      dateIssued: new Date().toISOString(),
      expiresAt,
      status: "active",
      revokeReason: null,
    };

    await insertPass(newPass, photoUrl);
    await logActivity("pass_issued", `Pass issued to ${fullName} (${email})`);

    // Send notification email
    supabase.functions.invoke('send-pass-email', {
      body: { fullName, email: email.toLowerCase(), code, expiresAt, photo: photoUrl },
    }).catch(err => console.error('Email send failed:', err));

    setLoading(false);
    onPassCreated(newPass);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10 pb-20 bg-primary">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.img
          src={logo}
          alt="Mad Monkey"
          className="h-16 mx-auto mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        />
        <Card className="shadow-pass">
          <CardContent className="pt-6">
            <h2 className="font-display text-xl font-bold text-center mb-5">Staff Discount Pass</h2>
            <form onSubmit={handleSubmit}>
              <p className="text-center text-sm text-muted-foreground mb-2">Please upload a clear photo of your face</p>
              <motion.div
                className="flex flex-col items-center mb-5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <div
                  className="w-28 h-28 rounded-full border-[3px] border-primary bg-muted flex items-center justify-center overflow-hidden mb-3 cursor-pointer transition-transform duration-200 hover:scale-105"
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
                  Upload Face Photo
                </Button>
                {photoError && <p className="text-destructive text-xs mt-1">{photoError}</p>}
              </motion.div>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <div>
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Sarah Jones" required />
                </div>
                <div>
                  <Label>Company Email</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@madmonkeyhostels.com" required />
                  {emailError && <p className="text-destructive text-xs mt-1">{emailError}</p>}
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Creating Pass..." : "Verify & Generate Pass"}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
        <p className="text-center mt-8">
          <button onClick={onAdminClick} className="text-primary-foreground/70 text-xs hover:text-primary-foreground transition-colors">
            Admin Login
          </button>
        </p>
      </motion.div>
    </div>
  );
}
