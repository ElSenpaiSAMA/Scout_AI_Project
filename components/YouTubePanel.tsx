"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Video = { title: string; views: number; likes: number; comments: number; channel: string; sentiment: string; url: string };
type Props = { videos: Video[]; sentiments: Record<string, number>; channels: string[]; avg_views: number };

const COLORS = { positive: "#16a34a", neutral: "#71717a", negative: "#dc2626" };
const SENTIMENT_ES: Record<string, string> = { positive: "positivo", neutral: "neutral", negative: "negativo" };

function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function YouTubePanel({ videos, sentiments, channels, avg_views }: Props) {
  const pieData = Object.entries(sentiments).map(([name, value]) => ({ name, value }));
  return (
    <div className="bg-white border border-zinc-200 p-6">
      <p className="text-xs font-semibold text-zinc-900 uppercase tracking-widest mb-5">Inteligencia YouTube</p>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs text-zinc-900 mb-1">Engagement medio</p>
          <p className="text-3xl font-light text-zinc-900">{formatViews(avg_views)}</p>
          <p className="text-xs text-zinc-900">vistas por video</p>
        </div>
        <ResponsiveContainer width="100%" height={80}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={20} outerRadius={35} dataKey="value">
              {pieData.map((e, i) => <Cell key={i} fill={COLORS[e.name as keyof typeof COLORS] || "#71717a"} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: 0, fontSize: 11 }}
              formatter={(value, name) => [value, SENTIMENT_ES[name as string] || name]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {videos.slice(0, 4).map((v, i) => (
          <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" className="block border border-zinc-100 bg-zinc-50 p-3 hover:border-zinc-300 transition-colors">
            <p className="text-xs text-zinc-900 mb-1.5 leading-relaxed">{v.title}</p>
            <div className="flex gap-3 text-xs text-zinc-900">
              <span>{v.channel}</span>
              <span>{formatViews(v.views)} vistas</span>
              <span>{v.comments} comentarios</span>
              <span style={{ color: COLORS[v.sentiment as keyof typeof COLORS] }}>{SENTIMENT_ES[v.sentiment] || v.sentiment}</span>
            </div>
          </a>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {channels.map((c, i) => (
          <span key={i} className="text-xs border border-zinc-200 text-zinc-900 px-2 py-1">{c}</span>
        ))}
      </div>
    </div>
  );
}
