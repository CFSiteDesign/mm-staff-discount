import { supabase } from "@/integrations/supabase/client";

export interface StaffPass {
  id: string;
  fullName: string;
  email: string;
  photo: string;
  photoUrl?: string;
  code: string;
  dateIssued: string;
  expiresAt: string;
  status: 'active' | 'revoked';
  revokeReason: string | null;
}

export interface ActivityLogEntry {
  timestamp: string;
  action: string;
  details: string;
}

export function isPassExpired(pass: StaffPass): boolean {
  return new Date(pass.expiresAt).getTime() <= Date.now();
}

export function getTimeRemaining(pass: StaffPass): { hours: number; minutes: number; seconds: number; expired: boolean } {
  const diff = new Date(pass.expiresAt).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    expired: false,
  };
}

const DEFAULT_DOMAINS = [
  "madmonkeyhostels.com",
  "thesnowleague.com",
  "lapee.dk",
  "gigpig.uk",
  "plots.events",
  "hustlesasa.com",
  "soundboks.com",
  "222.place",
  "xceed.me",
  "unhurd.co.uk",
  "getthursday.com",
  "lex.lgbt",
  "woov.com",
  "togather.com",
  "flickplay.co",
  "tourhero.com",
  "realtainment.group",
  "p-o-o-l.xyz",
  "theup.co",
  "bestnights.vc",
];

// Approved domains still kept in localStorage (simple config, not user data)
export function getApprovedDomains(): string[] {
  const raw = localStorage.getItem("mm_approvedDomains");
  if (!raw) {
    localStorage.setItem("mm_approvedDomains", JSON.stringify(DEFAULT_DOMAINS));
    return [...DEFAULT_DOMAINS];
  }
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [...DEFAULT_DOMAINS];
}

export function saveApprovedDomains(domains: string[]): void {
  localStorage.setItem("mm_approvedDomains", JSON.stringify(domains));
}

// Approved individual creator emails (synced from server)
export function getApprovedCreatorEmails(): string[] {
  const raw = localStorage.getItem("mm_approvedCreatorEmails");
  if (!raw) {
    localStorage.setItem("mm_approvedCreatorEmails", JSON.stringify([]));
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((e: string) => e.toLowerCase()) : [];
  } catch {
    return [];
  }
}

export function saveApprovedCreatorEmails(emails: string[]): void {
  const normalized = Array.from(new Set(emails.map(e => e.toLowerCase())));
  localStorage.setItem("mm_approvedCreatorEmails", JSON.stringify(normalized));
}

export interface CreatorEmail {
  id: string;
  email: string;
  fullName: string | null;
  creatorId: string | null;
  source: string;
  isActive: boolean;
  syncedAt: string;
}

export async function fetchCreatorEmails(): Promise<CreatorEmail[]> {
  const { data, error } = await supabase
    .from("approved_creator_emails")
    .select("*")
    .order("synced_at", { ascending: false });
  if (error) {
    console.error("Error fetching creator emails:", error);
    return [];
  }
  return (data || []).map(row => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    creatorId: row.creator_id,
    source: row.source,
    isActive: row.is_active,
    syncedAt: row.synced_at,
  }));
}

export async function syncCreatorEmailsToLocalStorage(): Promise<void> {
  const { data, error } = await supabase
    .from("approved_creator_emails")
    .select("email")
    .eq("is_active", true);
  if (error) {
    console.error("Error syncing creator emails:", error);
    return;
  }
  const emails = (data || []).map(r => r.email.toLowerCase());
  saveApprovedCreatorEmails(emails);
}

export async function setCreatorActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from("approved_creator_emails")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) console.error("Error updating creator:", error);
}

export async function addCreatorEmail(email: string, fullName?: string): Promise<void> {
  const { error } = await supabase
    .from("approved_creator_emails")
    .upsert({
      email: email.toLowerCase(),
      full_name: fullName || null,
      source: 'manual',
      is_active: true,
      synced_at: new Date().toISOString(),
    }, { onConflict: 'email' });
  if (error) console.error("Error adding creator:", error);
}

// Database operations for passes
export async function fetchPasses(): Promise<StaffPass[]> {
  const { data, error } = await supabase
    .from("staff_passes")
    .select("*")
    .order("date_issued", { ascending: false });

  if (error) {
    console.error("Error fetching passes:", error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    photo: row.photo || "",
    photoUrl: row.photo_url || "",
    code: row.code,
    dateIssued: row.date_issued,
    expiresAt: row.expires_at,
    status: row.status as 'active' | 'revoked',
    revokeReason: row.revoke_reason,
  }));
}

export async function insertPass(pass: StaffPass, photoUrl?: string): Promise<void> {
  const { error } = await supabase.from("staff_passes").insert({
    id: pass.id,
    full_name: pass.fullName,
    email: pass.email,
    photo: pass.photo,
    photo_url: photoUrl || null,
    code: pass.code,
    date_issued: pass.dateIssued,
    expires_at: pass.expiresAt,
    status: pass.status,
    revoke_reason: pass.revokeReason,
  });
  if (error) console.error("Error inserting pass:", error);
}

export async function updatePassStatus(id: string, status: 'active' | 'revoked', revokeReason: string | null): Promise<void> {
  const { error } = await supabase
    .from("staff_passes")
    .update({ status, revoke_reason: revokeReason })
    .eq("id", id);
  if (error) console.error("Error updating pass:", error);
}

// Database operations for activity log
export async function fetchActivityLog(): Promise<ActivityLogEntry[]> {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching activity log:", error);
    return [];
  }

  return (data || []).map(row => ({
    timestamp: row.timestamp,
    action: row.action,
    details: row.details,
  }));
}

export async function logActivity(action: string, details: string): Promise<void> {
  const { error } = await supabase.from("activity_log").insert({
    action,
    details,
  });
  if (error) console.error("Error logging activity:", error);
}
