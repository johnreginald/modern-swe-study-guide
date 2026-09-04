// Client-side progress storage. One localStorage key per week: an array of booleans
// aligned with that week's "Done when" list. Emits a window event so bars update live.

export const PROGRESS_EVENT = "aeguide-progress";

function key(week: number): string {
  return `aeguide.done.week${week}`;
}

export function readWeek(week: number, size: number): boolean[] {
  const empty = Array.from({ length: size }, () => false);
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(key(week));
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return empty;
    return empty.map((_, i) => parsed[i] === true);
  } catch {
    return empty;
  }
}

export function writeWeek(week: number, values: boolean[]): void {
  try {
    window.localStorage.setItem(key(week), JSON.stringify(values));
  } catch {
    // Storage unavailable (private mode, quota). Progress simply does not persist.
  }
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
}

export function resetAll(weeks: number[]): void {
  try {
    for (const w of weeks) window.localStorage.removeItem(key(w));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
}

export function countDone(week: number, size: number): number {
  return readWeek(week, size).filter(Boolean).length;
}
