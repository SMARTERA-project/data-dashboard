export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

export const safeNumber = (x: unknown, fallback = 0) => {
  const n = typeof x === 'string' ? Number(x) : (x as number);
  return Number.isFinite(n) ? n : fallback;
};

export function formatIsoDateToDmy(ts?: string | null) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
}
