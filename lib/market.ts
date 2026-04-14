import googleTrends from "google-trends-api";
import { buildPrediction, buildSeasonality } from "./trends";

export async function fetchTrends(product: string) {
  try {
    const [interestRes, relatedRes] = await Promise.all([
      googleTrends.interestOverTime({ keyword: product, startTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), geo: "ES" }),
      googleTrends.relatedQueries({ keyword: product, geo: "ES" }),
    ]);
    const interest = JSON.parse(interestRes);
    const related = JSON.parse(relatedRes);
    const timeline = (interest.default?.timelineData || []).map((d: any) => ({
      date: new Date(parseInt(d.time) * 1000).toISOString().split("T")[0],
      value: d.value[0],
    }));
    const risingTerms = related.default?.rankedList?.[0]?.rankedKeyword?.slice(0, 6).map((k: any) => k.query) || [];
    const values = timeline.map((t: any) => t.value);
    const recent = values.slice(-4).reduce((a: number, b: number) => a + b, 0) / 4;
    const older = values.slice(-8, -4).reduce((a: number, b: number) => a + b, 0) / 4;
    const direction = recent > older * 1.1 ? "rising" : recent < older * 0.9 ? "declining" : "stable";
    const peakIdx = values.indexOf(Math.max(...values));
    return { timeline, prediction: buildPrediction(timeline), seasonality: buildSeasonality(timeline), rising_terms: risingTerms, direction, peak_month: timeline[peakIdx]?.date?.slice(0, 7) || "" };
  } catch {
    return { timeline: [], prediction: [], seasonality: [], rising_terms: [], direction: "unknown", peak_month: "" };
  }
}

export async function fetchReddit(product: string) {
  const POSITIVE = new Set(["great","amazing","love","best","awesome","excellent","good","perfect","fantastic","brilliant","loved","recommended"]);
  const NEGATIVE = new Set(["bad","terrible","worst","hate","awful","horrible","poor","disappointing","broken","scam","overpriced","avoid"]);

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY!,
      query: `${product} opinions reviews discussion`,
      search_depth: "basic",
      max_results: 10,
      include_answer: false,
    }),
  });

  if (!res.ok) throw new Error(`Tavily API error: ${res.status}`);

  const json = await res.json();
  const results: any[] = json?.results ?? [];

  const processed = results.map((r) => {
    const text = (r.title + " " + (r.content ?? "")).toLowerCase();
    const words = new Set<string>(text.split(/\s+/));
    const sentiment = [...words].some((w) => POSITIVE.has(w)) ? "positive" : [...words].some((w) => NEGATIVE.has(w)) ? "negative" : "neutral";
    return {
      title: (r.title as string).slice(0, 150),
      score: Math.round((r.score ?? 0) * 1000),
      subreddit: new URL(r.url).hostname.replace("www.", ""),
      num_comments: 0,
      sentiment,
    };
  });

  const sentiments = processed.reduce((acc: any, p) => ({ ...acc, [p.sentiment]: (acc[p.sentiment] || 0) + 1 }), {});
  const subreddits = [...new Set(processed.map((p) => p.subreddit))].slice(0, 5);
  return {
    posts: processed.slice(0, 8),
    sentiments,
    subreddits,
    avg_score: Math.round(processed.reduce((a, p) => a + p.score, 0) / (processed.length || 1)),
  };
}
