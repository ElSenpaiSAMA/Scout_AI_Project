import { NextRequest, NextResponse } from "next/server";
import { fetchTavily } from "@/lib/market";

export async function POST(req: NextRequest) {
  const { product } = await req.json();
  try {
    const data = await fetchTavily(product);
    return NextResponse.json(data);
  } catch (e) {
    console.error("Tavily fetch error:", e);
    return NextResponse.json({ error: "No se pudo obtener datos de Tavily" }, { status: 502 });
  }
}
