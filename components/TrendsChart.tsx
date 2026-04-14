"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceDot,
} from "recharts";

type Props = {
  timeline: any[];
  prediction: any[];
  forecastValues?: number[];
  opportunities?: { week: number; label: string }[];
};

export default function TrendsChart({ timeline, prediction, forecastValues, opportunities }: Props) {
  const historical = timeline.slice(-12).map((t) => ({ date: t.date.slice(0, 7), historical: t.value }));

  const lastDate = historical[historical.length - 1]?.date ?? "";
  const lastValue = historical[historical.length - 1]?.historical ?? 50;

  const forecastPoints = (forecastValues ?? prediction.slice(0, 8).map((t) => t.value)).map((value, i) => {
    const d = new Date(lastDate + "-01");
    d.setMonth(d.getMonth() + i + 1);
    return { date: d.toISOString().slice(0, 7), forecast: value };
  });

  const combined = [
    ...historical.map((h) => ({ ...h, forecast: undefined })),
    { date: lastDate, historical: lastValue, forecast: lastValue },
    ...forecastPoints.map((p) => ({ date: p.date, historical: undefined, forecast: p.forecast })),
  ];

  const opportunityDots = (opportunities ?? []).map((o) => {
    const point = forecastPoints[o.week - 1];
    return point ? { date: point.date, value: point.forecast, label: o.label } : null;
  }).filter(Boolean) as { date: string; value: number; label: string }[];

  const useAI = !!forecastValues;

  return (
    <div className="bg-white border border-zinc-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs font-semibold text-zinc-900 uppercase tracking-widest">
          Interés de búsqueda + Predicción 30 días
        </p>
        {useAI && (
          <span className="text-xs border border-zinc-900 text-zinc-900 px-2 py-0.5 font-medium">
            Predicción IA
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={combined}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis dataKey="date" tick={{ fill: "#09090b", fontSize: 11 }} tickLine={false} interval={2} />
          <YAxis tick={{ fill: "#09090b", fontSize: 11 }} tickLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: 0, fontSize: 11, color: "#09090b" }}
            formatter={(value: any, name: string) => [value, name === "forecast" ? (useAI ? "Pronóstico IA" : "Predicción") : "Histórico"]}
          />
          <Legend
            wrapperStyle={{ color: "#09090b", fontSize: 11 }}
            formatter={(value) => value === "forecast" ? (useAI ? "Pronóstico IA" : "Predicción") : "Histórico"}
          />
          <Line type="monotone" dataKey="historical" stroke="#09090b" strokeWidth={2} dot={false} name="historical" connectNulls={false} />
          <Line
            type="monotone" dataKey="forecast"
            stroke={useAI ? "#2563eb" : "#71717a"}
            strokeWidth={useAI ? 2 : 1.5}
            strokeDasharray="6 3"
            dot={false} name="forecast" connectNulls={false}
          />
          {opportunityDots.map((o, i) => (
            <ReferenceDot
              key={i} x={o.date} y={o.value}
              r={5} fill="#16a34a" stroke="#ffffff" strokeWidth={2}
              label={{ value: "↑", position: "top", fontSize: 12, fill: "#16a34a" }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {opportunityDots.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {opportunityDots.map((o, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-zinc-700">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600 flex-shrink-0" />
              <span>{o.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
