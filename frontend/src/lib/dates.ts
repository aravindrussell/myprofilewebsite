const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2024-09" -> "Sep 2024"; "" -> "Present". */
export function formatYearMonth(value: string): string {
  if (!value) return "Present";
  const [y, m] = value.split("-");
  return `${MONTHS[Number(m) - 1] ?? ""} ${y ?? ""}`.trim();
}

/** Human duration between two YYYY-MM values ("" end = now), e.g. "2 yrs 3 mos". */
export function duration(start: string, end: string, now = new Date()): string {
  const [sy = 0, sm = 1] = start.split("-").map(Number);
  const [ey, em] = end ? end.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const months = Math.max(1, ((ey ?? sy) - sy) * 12 + ((em ?? sm) - sm));
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  const parts = [];
  if (yrs) parts.push(`${yrs} yr${yrs > 1 ? "s" : ""}`);
  if (mos) parts.push(`${mos} mo${mos > 1 ? "s" : ""}`);
  return parts.join(" ");
}

/** Whole years from a YYYY-MM date until now. */
export function yearsSince(start: string, now = new Date()): number {
  const [y = 0, m = 1] = start.split("-").map(Number);
  return Math.floor((now.getFullYear() * 12 + now.getMonth() + 1 - (y * 12 + m)) / 12);
}
