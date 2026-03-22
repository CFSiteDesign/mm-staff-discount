import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { StaffPass } from "@/lib/db";
import { toast } from "sonner";

interface Props {
  pass: StaffPass;
  onReset: () => void;
}

export default function DigitalPass({ pass, onReset }: Props) {
  const [showEmail, setShowEmail] = useState(false);
  const date = new Date(pass.dateIssued);
  const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const firstName = pass.fullName.split(" ")[0];

  const sendEmail = () => {
    setShowEmail(true);
    toast.success(`Pass sent to ${pass.email}!`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        {/* Pass Card */}
        <div className="bg-card rounded-2xl overflow-hidden shadow-pass border-t-[6px] border-primary text-center p-8 mb-5">
          <p className="font-display text-xl font-black text-primary mb-4">🐒 MAD MONKEY</p>
          <span className="inline-block bg-secondary text-secondary-foreground text-xs font-bold tracking-widest px-3 py-1.5 rounded-full mb-5">
            CERTIFIED STAFF
          </span>
          <img src={pass.photo} alt={pass.fullName} className="w-32 h-32 rounded-full border-4 border-primary mx-auto mb-4 object-cover" />
          <h2 className="font-display text-2xl font-black uppercase mb-1">{pass.fullName}</h2>
          <p className="text-muted-foreground text-sm mb-6">{pass.email}</p>

          <div className="bg-primary text-primary-foreground py-4 px-5 rounded-lg text-xl font-black -rotate-2 shadow-primary-glow mb-6">
            50% FOOD & BEVERAGE
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-3 mb-4">
            <p className="text-xs text-muted-foreground mb-1">UNIQUE VERIFICATION CODE</p>
            <p className="font-mono text-lg font-bold tracking-wider">{pass.code}</p>
          </div>

          <p className="text-xs text-muted-foreground">
            Issued: {dateStr}<br />Valid at all Mad Monkey locations worldwide
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button size="lg" className="w-full" onClick={sendEmail}>Send to My Email</Button>
          <Button size="lg" variant="secondary" className="w-full" onClick={onReset}>Generate New Pass</Button>
        </div>

        {/* Email Preview Dialog */}
        <Dialog open={showEmail} onOpenChange={setShowEmail}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-normal">
                <strong>Subject:</strong> Your Mad Monkey 50% Discount Pass is Ready!
                <br /><span className="text-muted-foreground text-xs">From: staff@madmonkeyhostels.com</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <p className="font-display text-xl font-black text-primary text-center">🐒 MAD MONKEY</p>
              <p>Hi {firstName},</p>
              <p>Your Mad Monkey Certified digital discount pass has been verified and is ready to use.</p>
              <div className="bg-accent border-l-4 border-primary p-4 rounded">
                <p><strong>UNIQUE CODE:</strong> <span className="font-mono font-bold">{pass.code}</span></p>
                <p><strong>DISCOUNT:</strong> 50% Food & Beverage</p>
              </div>
              <p><strong>Instructions:</strong> Present the digital pass on your phone to any Mad Monkey staff member to receive your discount.</p>
              <p className="italic text-muted-foreground">This pass is valid at all Mad Monkey locations worldwide.</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
