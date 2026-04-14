import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export function buildPrompt(product: string, audience: string, objective: string, trends: any, youtube: any, tavily?: any) {
  const rising = trends.rising_terms?.join(", ") || "none";
  const videos = youtube.videos?.slice(0, 3).map((v: any) => `"${v.title}" (${v.views?.toLocaleString()} vistas, ${v.sentiment})`).join("\n") || "";
  const articles = tavily?.articles?.slice(0, 3).map((a: any) => `"${a.title}" — ${a.domain} (${a.sentiment})`).join("\n") || "";
  const webAnswer = tavily?.answer ? `\n- Resumen web: ${tavily.answer.slice(0, 300)}` : "";
  return `Crea un scout de campaña profesional en español:

Producto: ${product}
Audiencia: ${audience}
Objetivo: ${objective}

Datos de mercado:
- Tendencia: ${trends.direction} (pico: ${trends.peak_month})
- Búsquedas en alza: ${rising}
- Engagement YouTube: media ${youtube.avg_views?.toLocaleString()} vistas por video
- Sentimiento YouTube: ${JSON.stringify(youtube.sentiments)}
- Videos destacados esta semana:
${videos}
- Sentimiento web: ${JSON.stringify(tavily?.sentiments || {})}${webAnswer}
- Artículos y noticias recientes:
${articles}

## Panorama de Mercado
## Insights de Audiencia
## Mensajes Clave (3 enfoques)
## Canales Recomendados
## KPIs a Seguir
## Mejor Momento de Lanzamiento
## Acciones Inmediatas
## Riesgos a Considerar

Sé específico. Cita los datos. Sin consejos genéricos. Todo en español.`;
}

export async function generateScoutText(product: string, audience: string, objective: string, trends: any, youtube: any, tavily?: any): Promise<string> {
  const prompt = buildPrompt(product, audience, objective, trends, youtube, tavily);
  let text = "";
  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: "Eres un estratega senior de marketing digital. Crea scouts de campaña basados en datos, accionables y siempre en español. Cita números específicos.",
    messages: [{ role: "user", content: prompt }],
  });
  for await (const chunk of stream) {
    if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
      text += chunk.delta.text;
    }
  }
  return text;
}

export async function streamScout(product: string, audience: string, objective: string, trends: any, youtube: any, tavily?: any): Promise<ReadableStream> {
  const prompt = buildPrompt(product, audience, objective, trends, youtube, tavily);
  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: "Eres un estratega senior de marketing digital. Crea scouts de campaña basados en datos, accionables y siempre en español.",
    messages: [{ role: "user", content: prompt }],
  });
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });
}
