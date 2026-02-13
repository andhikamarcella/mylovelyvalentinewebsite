export const RELATIONSHIP_START_ISO = "2024-06-10T00:00:00+07:00";

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

export function daysTogether(now = new Date()) {
  const start = new Date(RELATIONSHIP_START_ISO);
  const a = startOfLocalDay(start).getTime();
  const b = startOfLocalDay(now).getTime();
  const diff = Math.max(0, b - a);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function nextAnniversary(now = new Date()) {
  const base = new Date(RELATIONSHIP_START_ISO);
  const month = base.getMonth();
  const date = base.getDate();
  const yearNow = now.getFullYear();
  const candidate = new Date(yearNow, month, date, 0, 0, 0, 0);
  if (candidate.getTime() > now.getTime()) return candidate;
  return new Date(yearNow + 1, month, date, 0, 0, 0, 0);
}

export function diffParts(target: Date, now = new Date()) {
  const totalMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { totalMs, days, hours, minutes, seconds };
}

