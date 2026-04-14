import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export function buildPrompt(product: string, audience: string, objective: string, trends: any, reddit: any) {
  const rising = trends.rising_terms?.join(", ") || "none";
  const posts = reddit.posts?.slice(0, 3).map((p: any) => `"${p.title}" (${p.score} upvotes, ${p.sentiment})`).join("\n") || "";
  return `Crea un scout de campaña profesional en español:

Producto: ${product}
Audiencia: ${audience}
Objetivo: ${objective}

Datos de mercado:
- Tendencia: ${trends.direction} (pico: ${trends.peak_month})
- Búsquedas en alza: ${rising}
- Engagement Reddit: media ${reddit.avg_score} votos
- Sentimiento: ${JSON.stringify(reddit.sentiments)}
- Discusiones destacadas:
${posts}

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

export async function generateScoutText(product: string, audience: string, objective: string, trends: any, reddit: any): Promise<string> {
  const prompt = buildPrompt(product, audience, objective, trends, reddit);
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

export async function streamScout(product: string, audience: string, objective: string, trends: any, reddit: any): Promise<ReadableStream> {
  const prompt = buildPrompt(product, audience, objective, trends, reddit);
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
