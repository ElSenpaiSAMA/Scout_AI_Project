import { NextRequest, NextResponse } from "next/server";
import { fetchYouTube } from "@/lib/market";

export async function POST(req: NextRequest) {
  const { product } = await req.json();
  try {
    const data = await fetchYouTube(product);
    return NextResponse.json(data);
  } catch (e) {
    console.error("YouTube fetch error:", e);
    return NextResponse.json({ error: "No se pudo obtener datos de YouTube" }, { status: 502 });
  }
}
