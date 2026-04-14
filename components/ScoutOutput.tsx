"use client";

type Props = { text: string; isStreaming: boolean; onExport: () => void };

export default function ScoutOutput({ text, isStreaming, onExport }: Props) {
  const formatted = text
    .replace(/## (.+)/g, '<h3 class="text-zinc-900 text-sm font-semibold uppercase tracking-widest mt-6 mb-2 pb-2 border-b border-zinc-200">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

  return (
    <div className="bg-white border border-zinc-200 rounded-none p-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200">
        <div>
          <p className="text-xs font-semibold text-zinc-900 uppercase tracking-widest">Scout de Campaña</p>
          {isStreaming && <p className="text-xs text-zinc-900 mt-0.5">Generando<span className="animate-pulse">...</span></p>}
        </div>
        {!isStreaming && text && (
          <button onClick={onExport} className="text-xs font-semibold text-zinc-900 border border-zinc-900 px-4 py-2 hover:bg-zinc-900 hover:text-white transition-colors">
            Exportar PDF
          </button>
        )}
      </div>
      {text ? (
        <div className="text-sm text-zinc-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
      ) : (
        <div className="text-zinc-900 text-sm text-center py-12">El scout aparecerá aquí en tiempo real</div>
      )}
    </div>
  );
}
