import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/mad-monkey-logo.png";

interface Props {
  email: string;
}

export default function CheckEmail({ email }: Props) {
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
          transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
        />
        <Card className="shadow-pass">
          <CardContent className="pt-8 pb-8 text-center">
            <motion.div
              className="w-16 h-16 rounded-full bg-success flex items-center justify-center mx-auto mb-5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
            >
              <Mail className="w-8 h-8 text-success-foreground" />
            </motion.div>
            <h2 className="font-display font-black text-2xl mb-3">You're verified!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              We've sent your Mad Monkey staff discount pass to:
            </p>
            <p className="font-bold text-base mb-5 break-all">{email}</p>
            <div className="bg-accent rounded-lg p-4 text-left text-sm space-y-2">
              <p className="font-semibold">📬 To view your pass:</p>
              <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                <li>Open your inbox</li>
                <li>
                  Check your <strong>junk / spam folder</strong> if you don't see it
                </li>
                <li>
                  Look for an email from{" "}
                  <span className="whitespace-nowrap font-medium">madmonkey@verify.theorox.com</span>
                </li>
              </ol>
            </div>
            <p className="text-xs text-muted-foreground mt-5">
              Your pass is valid for 1 year at all Mad Monkey locations worldwide.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}