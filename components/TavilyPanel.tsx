"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Article = { title: string; url: string; domain: string; snippet: string; sentiment: string };
type Props = { articles: Article[]; sentiments: Record<string, number>; answer: string };

const COLORS = { positive: "#16a34a", neutral: "#71717a", negative: "#dc2626" };
const SENTIMENT_ES: Record<string, string> = { positive: "positivo", neutral: "neutral", negative: "negativo" };

export default function TavilyPanel({ articles, sentiments, answer }: Props) {
  const pieData = Object.entries(sentiments).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white border border-zinc-200 p-6">
      <p className="text-xs font-semibold text-zinc-900 uppercase tracking-widest mb-5">Inteligencia Web</p>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs text-zinc-900 mb-1">Artículos encontrados</p>
          <p className="text-3xl font-light text-zinc-900">{articles.length}</p>
          <p className="text-xs text-zinc-900">fuentes esta semana</p>
        </div>
        <ResponsiveContainer width="100%" height={80}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={20} outerRadius={35} dataKey="value">
              {pieData.map((e, i) => <Cell key={i} fill={COLORS[e.name as keyof typeof COLORS] || "#71717a"} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: 0, fontSize: 11 }}
              formatter={(value, name) => [value, SENTIMENT_ES[name as string] || name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {answer && (
        <div className="border-l-2 border-zinc-900 pl-3 mb-4">
          <p className="text-xs text-zinc-900 leading-relaxed">{answer.slice(0, 200)}{answer.length > 200 ? "…" : ""}</p>
        </div>
      )}

      <div className="space-y-2">
        {articles.slice(0, 4).map((a, i) => (
          <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-zinc-100 bg-zinc-50 p-3 hover:border-zinc-300 transition-colors">
            <p className="text-xs text-zinc-900 mb-1.5 leading-relaxed font-medium">{a.title}</p>
            <div className="flex gap-3 text-xs text-zinc-500">
              <span>{a.domain}</span>
              <span style={{ color: COLORS[a.sentiment as keyof typeof COLORS] }}>{SENTIMENT_ES[a.sentiment] || a.sentiment}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
