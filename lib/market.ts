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

export async function fetchYouTube(product: string) {
  const POSITIVE = new Set(["great","amazing","love","best","awesome","excellent","good","perfect","fantastic","brilliant","recommended","review"]);
  const NEGATIVE = new Set(["bad","terrible","worst","hate","awful","horrible","poor","disappointing","broken","scam","overpriced","avoid","fake"]);

  const apiKey = process.env.YOUTUBE_API_KEY!;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(product)}&type=video&order=relevance&publishedAfter=${weekAgo}&maxResults=10&key=${apiKey}`
  );
  if (!searchRes.ok) throw new Error(`YouTube search error: ${searchRes.status}`);
  const searchJson = await searchRes.json();
  const items: any[] = searchJson?.items ?? [];

  if (items.length === 0) return { videos: [], sentiments: {}, channels: [], avg_views: 0 };

  const ids = items.map((i: any) => i.id.videoId).filter(Boolean).join(",");
  const statsRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${apiKey}`
  );
  if (!statsRes.ok) throw new Error(`YouTube stats error: ${statsRes.status}`);
  const statsJson = await statsRes.json();
  const statsMap: Record<string, any> = {};
  for (const v of statsJson?.items ?? []) statsMap[v.id] = v.statistics;

  const videos = items.map((item: any) => {
    const id = item.id.videoId;
    const title = item.snippet.title as string;
    const channel = item.snippet.channelTitle as string;
    const stats = statsMap[id] || {};
    const views = parseInt(stats.viewCount || "0");
    const likes = parseInt(stats.likeCount || "0");
    const comments = parseInt(stats.commentCount || "0");
    const words = new Set<string>(title.toLowerCase().split(/\s+/));
    const sentiment = [...words].some((w) => POSITIVE.has(w)) ? "positive" : [...words].some((w) => NEGATIVE.has(w)) ? "negative" : "neutral";
    return { title: title.slice(0, 150), views, likes, comments, channel, sentiment, url: `https://youtube.com/watch?v=${id}` };
  });

  const sentiments = videos.reduce((acc: any, v) => ({ ...acc, [v.sentiment]: (acc[v.sentiment] || 0) + 1 }), {});
  const channels = [...new Set(videos.map((v) => v.channel))].slice(0, 5);
  const avg_views = Math.round(videos.reduce((a, v) => a + v.views, 0) / (videos.length || 1));

  return { videos: videos.slice(0, 8), sentiments, channels, avg_views };
}

export async function fetchTavily(product: string) {
  const POSITIVE = new Set(["great","amazing","love","best","excellent","good","perfect","recommended","innovative","popular"]);
  const NEGATIVE = new Set(["bad","terrible","worst","hate","awful","poor","disappointing","recall","scandal","controversy","fake"]);

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY!,
      query: `${product} noticias opiniones tendencias`,
      search_depth: "basic",
      max_results: 8,
      include_answer: true,
    }),
  });

  if (!res.ok) throw new Error(`Tavily API error: ${res.status}`);
  const json = await res.json();
  const results: any[] = json?.results ?? [];

  const articles = results.map((r) => {
    const text = (r.title + " " + (r.content ?? "")).toLowerCase();
    const words = new Set<string>(text.split(/\s+/));
    const sentiment = [...words].some((w) => POSITIVE.has(w)) ? "positive" : [...words].some((w) => NEGATIVE.has(w)) ? "negative" : "neutral";
    const domain = (() => { try { return new URL(r.url).hostname.replace("www.", ""); } catch { return r.url; } })();
    return {
      title: (r.title as string).slice(0, 150),
      url: r.url as string,
      domain,
      snippet: ((r.content ?? "") as string).slice(0, 200),
      sentiment,
    };
  });

  const sentiments = articles.reduce((acc: any, a) => ({ ...acc, [a.sentiment]: (acc[a.sentiment] || 0) + 1 }), {});
  const answer = (json?.answer as string | undefined) ?? "";

  return { articles: articles.slice(0, 6), sentiments, answer };
}
