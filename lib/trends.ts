export type TrendPoint = { date: string; value: number };

export function buildPrediction(timeline: TrendPoint[], days = 30): TrendPoint[] {
  if (timeline.length < 4) return [];
  const values = timeline.map((t) => t.value);
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((s, y, x) => s + x * y, 0);
  const sumX2 = values.reduce((s, _, x) => s + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const lastDate = new Date(timeline[timeline.length - 1].date);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + i + 1);
    return { date: d.toISOString().split("T")[0], value: Math.max(0, Math.min(100, Math.round(intercept + slope * (n + i)))) };
  });
}

export function buildSeasonality(timeline: TrendPoint[]) {
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const months: Record<string, number[]> = {};
  timeline.forEach(({ date, value }) => {
    const m = names[new Date(date).getMonth()];
    if (!months[m]) months[m] = [];
    months[m].push(value);
  });
  return names.filter((m) => months[m]).map((m) => ({
    month: m,
    value: Math.round(months[m].reduce((a, b) => a + b, 0) / months[m].length),
  }));
}
