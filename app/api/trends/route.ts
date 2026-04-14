import { NextRequest, NextResponse } from "next/server";
import { fetchTrends } from "@/lib/market";

export async function POST(req: NextRequest) {
  const { product } = await req.json();
  const data = await fetchTrends(product);
  return NextResponse.json(data);
}
