import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
  const { product, trendsData, youtubeData, tavilyData } = await req.json();

  const last12 = (trendsData.timeline || []).slice(-12).map((t: any) => t.value).join(", ");
  const rising = trendsData.rising_terms?.join(", ") || "ninguno";
  const lastValue = trendsData.timeline?.slice(-1)[0]?.value ?? 50;

  const prompt = `Analiza estos datos de mercado y genera un pronóstico. Responde ÚNICAMENTE con el JSON indicado, sin markdown ni explicaciones.

Producto: ${product}
Tendencia: ${trendsData.direction} (pico: ${trendsData.peak_month})
Valores últimas 12 semanas (0-100): ${last12}
Último valor: ${lastValue}
Términos en alza: ${rising}
YouTube — sentimiento: ${JSON.stringify(youtubeData?.sentiments || {})}, media vistas: ${youtubeData?.avg_views || 0}
Web (Tavily) — sentimiento: ${JSON.stringify(tavilyData?.sentiments || {})}
Resumen web: ${(tavilyData?.answer || "").slice(0, 300)}

Responde con este JSON exacto:
{
  "direction": "rising|stable|declining",
  "confidence": <número 0-100>,
  "summary": "<2-3 frases en español explicando el pronóstico con datos concretos>",
  "optimal_window": "<descripción del mejor momento para lanzar campaña>",
  "opportunities": [
    { "week": <1-8>, "label": "<oportunidad concreta y corta>" }
  ],
  "risks": ["<riesgo 1>", "<riesgo 2>"],
  "weekly_values": [<8 números 0-100 que proyectan la demanda semana a semana>]
}

Para weekly_values: parte del último valor (${lastValue}) y proyecta 8 semanas considerando la tendencia, sentimiento y contexto. Sé realista.`;

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: "Eres un analista de mercado. Responde SOLO con JSON válido, sin texto adicional ni bloques de código.",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (msg.content[0] as any).text.trim();
    const json = JSON.parse(raw);
    return NextResponse.json(json);
  } catch (e) {
    console.error("Forecast error:", e);
    return NextResponse.json({ error: "No se pudo generar el pronóstico" }, { status: 502 });
  }
}
