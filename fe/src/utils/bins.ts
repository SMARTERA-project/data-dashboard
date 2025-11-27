export function getConsistentIncrement(v: number) {
  return Math.pow(10, Math.max(1, Math.ceil(Math.log10(Math.max(1, v))) - 1));
}

export function valueToBin(value: number, thresholds: number[]) {
  for (let i = 0; i < thresholds.length; i++)
    if (value <= thresholds[i]) return i;
  return thresholds.length - 1;
}

export function buildLegendLabels(minVal: number, thresholds: number[]) {
  const labels: string[] = [];
  let lower = Math.min(minVal, 1);
  for (let i = 0; i < thresholds.length; i++) {
    const upper = thresholds[i];
    labels.push(
      lower === upper
        ? `${upper.toLocaleString()}`
        : `${lower.toLocaleString()}–${upper.toLocaleString()}`
    );
    lower = Number.isInteger(upper) ? upper + 1 : upper;
  }
  return labels;
}
