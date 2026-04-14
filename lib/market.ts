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
  const POSITIVE = new Set(["great","amazing","love","best","awesome","excellent","good","perfect","fantastic","brilliant"]);
  const NEGATIVE = new Set(["bad","terrible","worst","hate","awful","horrible","poor","disappointing","broken","scam"]);

  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(product)}&sort=hot&t=week&limit=20&raw_json=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "CampaignScoutGenerator/1.0" },
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`Reddit API error: ${res.status}`);

  const json = await res.json();
  const children: any[] = json?.data?.children ?? [];

  const processed = children.map((child) => {
    const p = child.data;
    const words = new Set<string>(p.title.toLowerCase().split(/\s+/));
    const sentiment = [...words].some((w) => POSITIVE.has(w)) ? "positive" : [...words].some((w) => NEGATIVE.has(w)) ? "negative" : "neutral";
    return { title: (p.title as string).slice(0, 150), score: p.score as number, subreddit: p.subreddit_name_prefixed as string, num_comments: p.num_comments as number, sentiment };
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
