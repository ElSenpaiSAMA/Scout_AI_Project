"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Post = { title: string; score: number; subreddit: string; num_comments: number; sentiment: string };
type Props = { posts: Post[]; sentiments: Record<string, number>; subreddits: string[]; avg_score: number };

const COLORS = { positive: "#16a34a", neutral: "#71717a", negative: "#dc2626" };
const SENTIMENT_ES: Record<string, string> = { positive: "positivo", neutral: "neutral", negative: "negativo" };

export default function RedditPanel({ posts, sentiments, subreddits, avg_score }: Props) {
  const pieData = Object.entries(sentiments).map(([name, value]) => ({ name, value }));
  return (
    <div className="bg-white border border-zinc-200 p-6">
      <p className="text-xs font-semibold text-zinc-900 uppercase tracking-widest mb-5">Inteligencia Reddit</p>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs text-zinc-900 mb-1">Engagement medio</p>
          <p className="text-3xl font-light text-zinc-900">{avg_score}</p>
          <p className="text-xs text-zinc-900">votos por post</p>
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
        {posts.slice(0, 4).map((p, i) => (
          <div key={i} className="border border-zinc-100 bg-zinc-50 p-3">
            <p className="text-xs text-zinc-900 mb-1.5 leading-relaxed">{p.title}</p>
            <div className="flex gap-3 text-xs text-zinc-900">
              <span>{p.subreddit}</span>
              <span>{p.score} votos</span>
              <span>{p.num_comments} comentarios</span>
              <span style={{ color: COLORS[p.sentiment as keyof typeof COLORS] }}>{SENTIMENT_ES[p.sentiment] || p.sentiment}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {subreddits.map((s, i) => (
          <span key={i} className="text-xs border border-zinc-200 text-zinc-900 px-2 py-1">{s}</span>
        ))}
      </div>
    </div>
  );
}
