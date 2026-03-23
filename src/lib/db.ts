export interface StaffPass {
  id: string;
  fullName: string;
  email: string;
  photo: string;
  code: string;
  dateIssued: string;
  expiresAt: string;
  status: 'active' | 'revoked';
  revokeReason: string | null;
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

export interface ActivityLogEntry {
  timestamp: string;
  action: string;
  details: string;
}

export interface AppDatabase {
  passes: StaffPass[];
  approvedDomains: string[];
  activityLog: ActivityLogEntry[];
}

const DB_KEY = 'madMonkeyData';
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
];

export function initDB(): void {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    localStorage.setItem(DB_KEY, JSON.stringify({
      passes: [],
      approvedDomains: DEFAULT_DOMAINS,
      activityLog: [],
    }));
  } else {
    // Always sync approved domains to the canonical list
    const parsed = JSON.parse(raw);
    parsed.approvedDomains = [...DEFAULT_DOMAINS];
    localStorage.setItem(DB_KEY, JSON.stringify(parsed));
  }
}

export function getDB(): AppDatabase {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    initDB();
    return JSON.parse(localStorage.getItem(DB_KEY)!);
  }
  const parsed = JSON.parse(raw);
  // Ensure all fields exist even if data was partially saved
  return {
    passes: Array.isArray(parsed.passes) ? parsed.passes : [],
    approvedDomains: Array.isArray(parsed.approvedDomains) ? parsed.approvedDomains : DEFAULT_DOMAINS,
    activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog : [],
  };
}

export function saveDB(data: AppDatabase): void {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

export function logActivity(action: string, details: string): void {
  const db = getDB();
  db.activityLog.unshift({ timestamp: new Date().toISOString(), action, details });
  if (db.activityLog.length > 100) db.activityLog.pop();
  saveDB(db);
}

initDB();
