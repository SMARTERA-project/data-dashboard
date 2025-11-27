export function hexToRgb(hex: string) {
  const m = hex.replace('#', '');
  const full =
    m.length === 3
      ? m
          .split('')
          .map(c => c + c)
          .join('')
      : m;
  const int = parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}
export function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  const h = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function interpolateHex(minHex: string, maxHex: string, t: number) {
  const a = hexToRgb(minHex);
  const b = hexToRgb(maxHex);
  return rgbToHex({
    r: lerp(a.r, b.r, t),
    g: lerp(a.g, b.g, t),
    b: lerp(a.b, b.b, t),
  });
}

export function ramp(minHex: string, maxHex: string, n: number) {
  if (n <= 1) return [maxHex];
  const out: string[] = [];
  for (let i = 0; i < n; i++)
    out.push(interpolateHex(minHex, maxHex, i / (n - 1)));
  return out;
}
