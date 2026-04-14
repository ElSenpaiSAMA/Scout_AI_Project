import { NextRequest, NextResponse } from "next/server";
import { streamScout } from "@/lib/generate";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
}

export async function POST(req: NextRequest) {
  const { product, audience, objective, trendsData, redditData, source = "web" } = await req.json();
  const encoder = new TextEncoder();
  let fullText = "";

  const readable = new ReadableStream({
    async start(controller) {
      const stream = await streamScout(product, audience, objective, trendsData, redditData);
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        fullText += chunk;
        controller.enqueue(encoder.encode(chunk));
      }
      await getSupabase().from("scouts").insert({ product, audience, objective, trends_data: trendsData, reddit_data: redditData, scout_text: fullText, source });
      controller.close();
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
