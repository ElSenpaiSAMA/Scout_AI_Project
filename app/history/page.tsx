"use client";

import { useEffect, useState } from "react";
import { supabase, Scout } from "@/lib/supabase";
import Link from "next/link";

export default function History() {
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [selected, setSelected] = useState<Scout | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "web" | "slack">("all");

  useEffect(() => {
    supabase
      .from("scouts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setScouts(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "all" ? scouts : scouts.filter((s) => s.source === filter);

  const formatted = selected?.scout_text
    .replace(
      /## (.+)/g,
      '<h3 class="text-zinc-900 text-sm font-semibold uppercase tracking-widest mt-6 mb-2 pb-2 border-b border-zinc-200">$1</h3>'
    )
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

  const FILTER_LABELS = { all: "Todos", web: "Web", slack: "Slack" };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-zinc-900 px-10 py-5 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold tracking-tight text-white">
            Scout <span className="font-light">IA</span>
          </div>
          <div className="text-xs text-zinc-400 mt-0.5 tracking-wide">Historial de scouts</div>
        </div>
        <Link
          href="/"
          className="text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-600 px-4 py-2 transition-colors"
        >
          Nuevo Scout
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-10 py-10">
        <div className="flex gap-1 mb-8">
          {(["all", "web", "slack"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-5 py-2 border transition-colors ${
                filter === f
                  ? "bg-zinc-900 border-zinc-900 text-white"
                  : "border-zinc-200 text-zinc-900 hover:border-zinc-400"
              }`}
            >
              {FILTER_LABELS[f]}{" "}
              <span className="font-normal">
                ({f === "all" ? scouts.length : scouts.filter((s) => s.source === f).length})
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-zinc-900 text-sm text-center py-20">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-zinc-900 text-sm text-center py-20">Sin scouts todavía.</div>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            <div className="space-y-2">
              {filtered.map((scout) => (
                <div
                  key={scout.id}
                  onClick={() => setSelected(scout)}
                  className={`border p-4 cursor-pointer transition-colors ${
                    selected?.id === scout.id
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-zinc-900 text-sm">{scout.product}</p>
                    <span className="text-xs text-zinc-900 uppercase tracking-wider">{scout.source}</span>
                  </div>
                  <p className="text-xs text-zinc-900 mb-3">{scout.audience}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs border border-zinc-200 text-zinc-900 px-2 py-0.5">
                      {scout.objective}
                    </span>
                    <span className="text-xs text-zinc-900">
                      {new Date(scout.created_at).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-span-2">
              {selected ? (
                <div className="border border-zinc-200 p-8">
                  <div className="flex items-start justify-between mb-6 pb-6 border-b border-zinc-200">
                    <div>
                      <h2 className="text-xl font-semibold text-zinc-900">{selected.product}</h2>
                      <p className="text-sm text-zinc-900 mt-1">
                        {selected.audience} · {selected.objective}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 border ${
                          selected.source === "slack"
                            ? "border-zinc-900 text-zinc-900"
                            : "border-zinc-200 text-zinc-900"
                        }`}
                      >
                        {selected.source}
                      </span>
                      <p className="text-xs text-zinc-900 mt-2">
                        {new Date(selected.created_at).toLocaleString("es-ES")}
                      </p>
                    </div>
                  </div>
                  <div
                    className="text-sm text-zinc-900 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatted || "" }}
                  />
                </div>
              ) : (
                <div className="border border-zinc-200 flex items-center justify-center h-64">
                  <p className="text-zinc-900 text-sm">Selecciona un scout para verlo</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
