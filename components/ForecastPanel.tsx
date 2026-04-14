"use client";

type Forecast = {
  direction: "rising" | "stable" | "declining";
  confidence: number;
  summary: string;
  optimal_window: string;
  opportunities: { week: number; label: string }[];
  risks: string[];
};

type Props = { forecast: Forecast | null; loading: boolean };

const DIR = {
  rising:   { label: "Tendencia alcista",  color: "#16a34a", arrow: "↑" },
  stable:   { label: "Tendencia estable",  color: "#d97706", arrow: "→" },
  declining:{ label: "Tendencia bajista",  color: "#dc2626", arrow: "↓" },
};

export default function ForecastPanel({ forecast, loading }: Props) {
  return (
    <div className="bg-white border border-zinc-200 p-6">
      <p className="text-xs font-semibold text-zinc-900 uppercase tracking-widest mb-5">Pronóstico IA — Próximas 8 semanas</p>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-zinc-400 py-6">
          <span className="animate-pulse">Analizando tendencias con IA...</span>
        </div>
      )}

      {!loading && !forecast && (
        <p className="text-sm text-zinc-400">Sin datos de pronóstico.</p>
      )}

      {!loading && forecast && (() => {
        const dir = DIR[forecast.direction] ?? DIR.stable;
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-light" style={{ color: dir.color }}>{dir.arrow}</div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">{dir.label}</p>
                <p className="text-xs text-zinc-500">{forecast.confidence}% confianza</p>
              </div>
              <div className="ml-auto">
                <div className="h-1.5 w-32 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-1.5 rounded-full" style={{ width: `${forecast.confidence}%`, backgroundColor: dir.color }} />
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-700 leading-relaxed border-l-2 border-zinc-200 pl-3">
              {forecast.summary}
            </p>

            {forecast.optimal_window && (
              <div className="bg-zinc-50 border border-zinc-200 px-4 py-3">
                <p className="text-xs font-semibold text-zinc-900 uppercase tracking-widest mb-1">Ventana óptima</p>
                <p className="text-xs text-zinc-700">{forecast.optimal_window}</p>
              </div>
            )}

            {forecast.opportunities?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-900 uppercase tracking-widest mb-2">Oportunidades</p>
                <div className="space-y-1.5">
                  {forecast.opportunities.map((o, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-700">
                      <span className="text-green-600 font-bold mt-0.5">S{o.week}</span>
                      <span>{o.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {forecast.risks?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-900 uppercase tracking-widest mb-2">Riesgos</p>
                <div className="space-y-1.5">
                  {forecast.risks.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-700">
                      <span className="text-red-500 font-bold mt-0.5">!</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
