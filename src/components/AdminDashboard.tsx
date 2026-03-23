import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getDB, saveDB, logActivity, isPassExpired } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/mad-monkey-logo.png";

interface Props {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: Props) {
  const [search, setSearch] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [domainsOpen, setDomainsOpen] = useState(false);
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const db = getDB();
  const total = db.passes.length;
  const active = db.passes.filter(p => p.status === "active" && !isPassExpired(p)).length;
  const expired = db.passes.filter(p => p.status === "active" && isPassExpired(p)).length;
  const revoked = db.passes.filter(p => p.status === "revoked").length;

  const filtered = useMemo(() =>
    db.passes
      .filter(p => p.fullName.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, total, active, expired, revoked]
  );

  const toggleStatus = (id: string, newStatus: "active" | "revoked") => {
    const data = getDB();
    const pass = data.passes.find(p => p.id === id);
    if (!pass) return;
    if (newStatus === "revoked") {
      const reason = prompt("Enter reason for revocation:");
      if (reason === null) return;
      pass.revokeReason = reason;
    } else {
      pass.revokeReason = null;
    }
    pass.status = newStatus;
    saveDB(data);
    logActivity(`pass_${newStatus}`, `Pass for ${pass.fullName} was ${newStatus}.`);
    refresh();
  };

  const addDomain = () => {
    let d = newDomain.trim().toLowerCase();
    if (d.startsWith("@")) d = d.substring(1);
    if (!d) return;
    const data = getDB();
    if (!data.approvedDomains.includes(d)) {
      data.approvedDomains.push(d);
      saveDB(data);
      logActivity("domain_added", `Domain @${d} added to whitelist.`);
      setNewDomain("");
      refresh();
    }
  };

  const removeDomain = (domain: string) => {
    if (!confirm(`Remove @${domain} from approved list?`)) return;
    const data = getDB();
    data.approvedDomains = data.approvedDomains.filter(dd => dd !== domain);
    saveDB(data);
    logActivity("domain_removed", `Domain @${domain} removed from whitelist.`);
    refresh();
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    onLogout();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-secondary pb-20">
      <motion.div
        className="max-w-5xl mx-auto px-5 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Mad Monkey" className="h-8 invert" />
            <h1 className="font-display text-xl font-black text-secondary-foreground tracking-tight">ADMIN</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="bg-card">Logout</Button>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Passes", value: total, color: "text-primary" },
            { label: "Active", value: active, color: "text-success" },
            { label: "Expired", value: expired, color: "text-muted-foreground" },
            { label: "Revoked", value: revoked, color: "text-destructive" },
          ].map(s => (
            <Card key={s.label} className="shadow-card hover:shadow-pass transition-shadow duration-300">
              <CardContent className="pt-5">
                <p className="text-muted-foreground text-sm">{s.label}</p>
                <p className={`text-3xl font-bold font-display ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Table */}
          <motion.div variants={itemVariants} className="flex-[2] min-w-0">
            <Card className="shadow-card overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between gap-3">
                <h3 className="font-display font-bold">Pass Registry</h3>
                <Input className="max-w-[200px]" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-accent">
                      <th className="text-left p-3 font-semibold">Name</th>
                      <th className="text-left p-3 font-semibold hidden sm:table-cell">Email</th>
                      <th className="text-left p-3 font-semibold">Code</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                      <th className="text-left p-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-accent/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img src={p.photo} className="w-7 h-7 rounded-full object-cover" alt="" />
                            <span className={p.status === "revoked" ? "line-through text-destructive" : ""}>{p.fullName}</span>
                          </div>
                        </td>
                        <td className="p-3 hidden sm:table-cell text-muted-foreground">{p.email}</td>
                        <td className="p-3 font-mono text-xs">{p.code}</td>
                        <td className="p-3">
                          {p.status === "revoked" ? (
                            <span className="text-destructive font-bold line-through">REVOKED</span>
                          ) : isPassExpired(p) ? (
                            <span className="text-muted-foreground font-bold">EXPIRED</span>
                          ) : (
                            <span className="text-success font-bold">ACTIVE</span>
                          )}
                        </td>
                        <td className="p-3">
                          {p.status === "active" ? (
                            <Button size="sm" variant="destructive" className="text-xs h-7 px-2" onClick={() => toggleStatus(p.id, "revoked")}>Revoke</Button>
                          ) : (
                            <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => toggleStatus(p.id, "active")}>Reactivate</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No passes found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={itemVariants} className="flex-1 min-w-[250px] space-y-5">
            <Card className="shadow-card">
              <CardContent className="pt-5">
                <button
                  type="button"
                  className="flex items-center justify-between w-full"
                  onClick={() => setDomainsOpen(o => !o)}
                >
                  <h3 className="font-display font-bold">Approved Domains ({db.approvedDomains.length})</h3>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${domainsOpen ? "rotate-180" : ""}`} />
                </button>
                {domainsOpen && (
                  <div className="mt-4">
                    <div className="flex gap-2 mb-4">
                      <Input placeholder="e.g. example.com" value={newDomain} onChange={e => setNewDomain(e.target.value)} />
                      <Button size="sm" onClick={addDomain}>Add</Button>
                    </div>
                    <ul className="space-y-0 max-h-60 overflow-y-auto">
                      {db.approvedDomains.map(d => (
                        <li key={d} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                          <span>@{d}</span>
                          <button className="text-destructive text-xs hover:underline" onClick={() => removeDomain(d)}>Remove</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-5">
                <h3 className="font-display font-bold mb-4">Activity Log</h3>
                <div className="max-h-72 overflow-y-auto space-y-2">
                  {db.activityLog.map((l, i) => (
                    <div key={i} className="text-xs border-b pb-2 last:border-0">
                      <p className="text-muted-foreground">{new Date(l.timestamp).toLocaleString()}</p>
                      <p>{l.details}</p>
                    </div>
                  ))}
                  {db.activityLog.length === 0 && <p className="text-muted-foreground text-xs">No activity yet</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
