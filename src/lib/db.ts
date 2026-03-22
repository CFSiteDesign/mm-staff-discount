export interface StaffPass {
  id: string;
  fullName: string;
  email: string;
  photo: string;
  code: string;
  dateIssued: string;
  status: 'active' | 'revoked';
  revokeReason: string | null;
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
const DEFAULT_DOMAINS = ["madmonkeyhostels.com", "bnvc.com", "exs.com", "thursday.com"];

export function initDB(): void {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify({
      passes: [],
      approvedDomains: DEFAULT_DOMAINS,
      activityLog: [],
    }));
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
