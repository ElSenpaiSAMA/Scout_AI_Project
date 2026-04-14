import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { fetchTrends, fetchReddit } from "@/lib/market";
import { generateScoutText } from "@/lib/generate";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 300;

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
}

function parseSlackCommand(text: string) {
  const parts = text.split("|").map((p) => p.trim());
  return {
    product: parts[0] || "",
    audience: parts[1] || "audiencia general",
    objective: parts[2] || "Reconocimiento de Marca",
  };
}

async function sendSlackMessage(responseUrl: string, text: string) {
  await fetch(responseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response_type: "in_channel", text }),
  });
}

async function runScoutBackground(product: string, audience: string, objective: string, userName: string, responseUrl: string) {
  try {
    await sendSlackMessage(responseUrl, `⏳ Analizando mercado para *${product}*... (~20 segundos)`);

    const [trends, reddit] = await Promise.all([fetchTrends(product), fetchReddit(product)]);
    const scoutText = await generateScoutText(product, audience, objective, trends, reddit);

    const { data: inserted } = await getSupabase()
      .from("scouts")
      .insert({ product, audience, objective, trends_data: trends, reddit_data: reddit, scout_text: scoutText, source: "slack" })
      .select("id")
      .single();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const scoutUrl = inserted?.id ? `${appUrl}/history?id=${inserted.id}` : `${appUrl}/history`;

    const direction = trends.direction === "rising" ? "📈" : trends.direction === "declining" ? "📉" : "➡️";
    const preview = scoutText.split("\n").slice(0, 10).join("\n");

    await sendSlackMessage(
      responseUrl,
      `${direction} *Scout de Campaña — ${product}*\n_@${userName} · ${objective}_\n\n${preview}\n\n<${scoutUrl}|Ver scout completo →>`
    );
  } catch (e) {
    console.error("Slack scout error:", e);
    await sendSlackMessage(responseUrl, `❌ Error generando el scout. Inténtalo de nuevo.`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const text = params.get("text") ?? "";
    const responseUrl = params.get("response_url") ?? "";
    const userName = params.get("user_name") ?? "usuario";

    if (!text.trim()) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "Uso: `/scout producto | audiencia | objetivo`\nEjemplo: `/scout zapatillas running | hombres 25-40 | Conversión`",
      });
    }

    const { product, audience, objective } = parseSlackCommand(text);

    waitUntil(runScoutBackground(product, audience, objective, userName, responseUrl));

    return NextResponse.json({
      response_type: "ephemeral",
      text: `🚀 Generando scout para *${product}*...`,
    });
  } catch (e) {
    console.error("Slack route error:", e);
    return NextResponse.json(
      { response_type: "ephemeral", text: "❌ Error interno. Inténtalo de nuevo." },
      { status: 200 }
    );
  }
}
