import { NextRequest, NextResponse } from "next/server";
import { fetchReddit } from "@/lib/market";

export async function POST(req: NextRequest) {
  const { product } = await req.json();
  try {
    const data = await fetchReddit(product);
    return NextResponse.json(data);
  } catch (e) {
    console.error("Reddit fetch error:", e);
    return NextResponse.json({ error: "No se pudo obtener datos de Reddit" }, { status: 502 });
  }
}
