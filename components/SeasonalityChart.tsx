"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Props = { data: { month: string; value: number }[] };

export default function SeasonalityChart({ data }: Props) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="bg-white border border-zinc-200 p-6">
      <p className="text-xs font-semibold text-zinc-900 uppercase tracking-widest mb-5">Mejores meses para lanzar</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis dataKey="month" tick={{ fill: "#09090b", fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fill: "#09090b", fontSize: 11 }} tickLine={false} domain={[0, 100]} />
          <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: 0, fontSize: 11, color: "#09090b" }} />
          <Bar dataKey="value" radius={[0, 0, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.value === max ? "#09090b" : entry.value > max * 0.7 ? "#52525b" : "#e4e4e7"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-zinc-900 mt-3">Negro = pico de interés · Gris oscuro = alto interés</p>
    </div>
  );
}
