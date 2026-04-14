import { NextRequest, NextResponse } from "next/server";
import { fetchReddit } from "@/lib/market";

export async function POST(req: NextRequest) {
  const { product } = await req.json();
  const data = await fetchReddit(product);
  return NextResponse.json(data);
}
