import { NextRequest, NextResponse } from "next/server";
import { streamScout } from "@/lib/generate";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
}

export async function POST(req: NextRequest) {
  const { product, audience, objective, trendsData, youtubeData, tavilyData, source = "web" } = await req.json();
  const encoder = new TextEncoder();
  let fullText = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await streamScout(product, audience, objective, trendsData, youtubeData, tavilyData);
        const reader = stream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          fullText += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
        const { error } = await getSupabase().from("scouts").insert({ product, audience, objective, trends_data: trendsData, youtube_data: youtubeData, tavily_data: tavilyData, scout_text: fullText, source });
        if (error) console.error("Supabase insert error:", error);
      } catch (e) {
        console.error("Scout stream error:", e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
