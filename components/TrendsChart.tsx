"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type Props = { timeline: any[]; prediction: any[] };

export default function TrendsChart({ timeline, prediction }: Props) {
  const historical = timeline.slice(-12).map((t) => ({ date: t.date.slice(0, 7), historical: t.value }));
  const predicted = prediction.slice(0, 8).map((t) => ({ date: t.date.slice(0, 7), prediction: t.value }));
  const combined = [
    ...historical.map((h) => ({ ...h, prediction: undefined })),
    { date: historical[historical.length - 1]?.date, historical: historical[historical.length - 1]?.historical, prediction: historical[historical.length - 1]?.historical },
    ...predicted.map((p) => ({ date: p.date, historical: undefined, prediction: p.prediction })),
  ];
  return (
    <div className="bg-white border border-zinc-200 p-6">
      <p className="text-xs font-semibold text-zinc-900 uppercase tracking-widest mb-5">Interés de búsqueda + Predicción 30 días</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={combined}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis dataKey="date" tick={{ fill: "#09090b", fontSize: 11 }} tickLine={false} interval={2} />
          <YAxis tick={{ fill: "#09090b", fontSize: 11 }} tickLine={false} domain={[0, 100]} />
          <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: 0, fontSize: 11, color: "#09090b" }} />
          <Legend wrapperStyle={{ color: "#09090b", fontSize: 11 }} />
          <Line type="monotone" dataKey="historical" stroke="#09090b" strokeWidth={2} dot={false} name="Histórico" connectNulls={false} />
          <Line type="monotone" dataKey="prediction" stroke="#71717a" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name="Predicción IA" connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
