"use client";

import { useState } from "react";
import Link from "next/link";
import TrendsChart from "@/components/TrendsChart";
import SeasonalityChart from "@/components/SeasonalityChart";
import RedditPanel from "@/components/RedditPanel";
import ScoutOutput from "@/components/ScoutOutput";

const OBJECTIVES = [
  "Reconocimiento de Marca",
  "Captación de Leads",
  "Conversión",
  "Retención",
  "Lanzamiento de Producto",
];

function calcOpportunityScore(trendsData: any, redditData: any): { score: number; label: string; reason: string; color: string } {
  let score = 0;

  const dirPts: Record<string, number> = { rising: 35, stable: 20, declining: 5, unknown: 10 };
  score += dirPts[trendsData.direction] ?? 10;

  const sentiments = redditData?.sentiments || {};
  const total = (Object.values(sentiments) as number[]).reduce((a, b) => a + b, 0);
  if (total > 0) {
    score += Math.round(((sentiments.positive || 0) / total) * 30);
  } else {
    score += 15;
  }

  const avg = redditData?.avg_score || 0;
  if (avg > 200) score += 15;
  else if (avg > 100) score += 12;
  else if (avg > 50) score += 8;
  else if (avg > 10) score += 5;
  else score += 2;

  score += Math.min((trendsData.rising_terms?.length || 0) * 4, 20);

  const s = Math.min(score, 100);
  if (s >= 70) return { score: s, label: "Alta Oportunidad", reason: "Mercado receptivo, tendencia creciente y sentimiento positivo", color: "#16a34a" };
  if (s >= 45) return { score: s, label: "Oportunidad Moderada", reason: "Condiciones favorables pero con aspectos a vigilar", color: "#d97706" };
  return { score: s, label: "Oportunidad Baja", reason: "Mercado difícil o con poco interés en este momento", color: "#dc2626" };
}

const DIR_COLOR: Record<string, string> = {
  rising: "#16a34a",
  declining: "#dc2626",
  stable: "#71717a",
  unknown: "#a1a1aa",
};

const DIR_LABEL: Record<string, string> = {
  rising: "Creciente",
  declining: "En declive",
  stable: "Estable",
  unknown: "Desconocido",
};

export default function Home() {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [objective, setObjective] = useState(OBJECTIVES[0]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [trendsData, setTrendsData] = useState<any>(null);
  const [redditData, setRedditData] = useState<any>(null);
  const [scoutText, setScoutText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const generate = async () => {
    if (!product.trim() || !audience.trim()) return;
    setLoading(true);
    setScoutText("");
    setTrendsData(null);
    setRedditData(null);

    try {
      setStep("Obteniendo datos de mercado...");
      const [trendsRes, redditRes] = await Promise.all([
        fetch("/api/trends", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product }) }),
        fetch("/api/reddit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product }) }),
      ]);
      const trends = await trendsRes.json();
      const reddit = await redditRes.json();
      setTrendsData(trends);
      setRedditData(reddit);

      setStep("Generando scout con Claude...");
      setIsStreaming(true);

      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, audience, objective, trendsData: trends, redditData: reddit }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value);
        setScoutText(full);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsStreaming(false);
      setStep("");
    }
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Scout de Campaña — ${product}`, 20, 20);
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(scoutText.replace(/[##🎯👥💡📣📊⏰🚀⚠️]/g, ""), 170), 20, 35);
    doc.save(`scout-${product.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-zinc-900 px-10 py-5 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold tracking-tight text-white">
            Scout <span className="font-light">IA</span>
          </div>
          <div className="text-xs text-zinc-400 mt-0.5 tracking-wide">
            Analiza el mercado con IA en tiempo real
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-xs text-zinc-400 border border-zinc-700 px-4 py-2">
            Slack: <span className="font-mono text-zinc-300">/scout producto | audiencia | objetivo</span>
          </div>
          <Link
            href="/history"
            className="text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-600 px-4 py-2 transition-colors"
          >
            Historial
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-10 py-10">
        <div className="border border-zinc-200 p-8 mb-10">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-xs font-semibold text-zinc-900 uppercase tracking-widest block mb-2">
                Producto o Servicio
              </label>
              <input
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="ej. zapatillas running España"
                className="w-full border border-zinc-200 text-zinc-900 text-sm px-4 py-3 focus:outline-none focus:border-zinc-900 placeholder-zinc-300 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-900 uppercase tracking-widest block mb-2">
                Audiencia Objetivo
              </label>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="ej. hombres 25-40 deportistas"
                className="w-full border border-zinc-200 text-zinc-900 text-sm px-4 py-3 focus:outline-none focus:border-zinc-900 placeholder-zinc-300 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-900 uppercase tracking-widest block mb-2">
                Objetivo de Campaña
              </label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full border border-zinc-200 text-zinc-900 text-sm px-4 py-3 focus:outline-none focus:border-zinc-900 bg-white"
              >
                {OBJECTIVES.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={generate}
            disabled={loading || !product.trim() || !audience.trim()}
            className="w-full bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-100 disabled:text-zinc-400 text-white text-sm font-semibold py-3.5 transition-colors tracking-wide"
          >
            {loading ? step || "Generando..." : "Generar Scout de Campaña"}
          </button>
        </div>

        {trendsData && (
          <>
            {(() => {
              const { score, label, reason, color } = calcOpportunityScore(trendsData, redditData);
              return (
                <div className="bg-zinc-900 p-6 mb-10 flex items-center gap-10">
                  <div className="text-center min-w-[90px]">
                    <p className="text-5xl font-light" style={{ color }}>{score}</p>
                    <p className="text-xs text-zinc-500 mt-1 tracking-widest">/ 100</p>
                  </div>
                  <div className="w-px h-12 bg-zinc-700" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Score de Oportunidad</p>
                    <p className="text-base font-semibold text-white">{label}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{reason}</p>
                  </div>
                  <div className="flex-1 max-w-xs">
                    <div className="h-1 bg-zinc-700">
                      <div className="h-1 transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
                    </div>
                    <p className="text-xs text-zinc-600 mt-2 text-right">{score}% potencial de mercado</p>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-4 gap-px bg-zinc-200 mb-10">
              {[
                {
                  label: "Tendencia",
                  value: DIR_LABEL[trendsData.direction] || trendsData.direction,
                  sub: `Pico: ${trendsData.peak_month}`,
                  color: DIR_COLOR[trendsData.direction],
                },
                {
                  label: "Datos históricos",
                  value: trendsData.timeline?.length || 0,
                  sub: "semanas de historial",
                },
                {
                  label: "Posts Reddit",
                  value: redditData?.posts?.length || 0,
                  sub: `media ${redditData?.avg_score} votos`,
                },
                {
                  label: "Términos en alza",
                  value: trendsData.rising_terms?.length || 0,
                  sub: "búsquedas relacionadas",
                },
              ].map((s, i) => (
                <div key={i} className="bg-white p-6">
                  <p className="text-xs font-semibold text-zinc-900 uppercase tracking-widest mb-2">{s.label}</p>
                  <p className="text-3xl font-light" style={s.color ? { color: s.color } : { color: "#09090b" }}>
                    {s.value}
                  </p>
                  <p className="text-xs text-zinc-900 mt-1">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <TrendsChart timeline={trendsData.timeline} prediction={trendsData.prediction} />
              <SeasonalityChart data={trendsData.seasonality} />
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <RedditPanel
                posts={redditData?.posts || []}
                sentiments={redditData?.sentiments || {}}
                subreddits={redditData?.subreddits || []}
                avg_score={redditData?.avg_score || 0}
              />
              <div className="col-span-2 bg-white border border-zinc-200 p-6">
                <p className="text-xs font-semibold text-zinc-900 uppercase tracking-widest mb-4">Términos en Alza</p>
                <div className="flex flex-wrap gap-2">
                  {trendsData.rising_terms?.map((t: string, i: number) => (
                    <span key={i} className="border border-zinc-200 text-zinc-900 text-xs px-3 py-1.5">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <ScoutOutput text={scoutText} isStreaming={isStreaming} onExport={exportPDF} />
          </>
        )}
      </main>
    </div>
  );
}
