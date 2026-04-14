declare module "google-trends-api" {
  interface TrendsOptions {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
    geo?: string;
    hl?: string;
    timezone?: number;
    category?: number;
    property?: string;
  }

  const googleTrends: {
    interestOverTime(options: TrendsOptions): Promise<string>;
    interestByRegion(options: TrendsOptions): Promise<string>;
    relatedTopics(options: TrendsOptions): Promise<string>;
    relatedQueries(options: TrendsOptions): Promise<string>;
    dailyTrends(options: { trendDate?: Date; geo?: string; hl?: string }): Promise<string>;
    realTimeTrends(options: { geo?: string; hl?: string; category?: string }): Promise<string>;
  };

  export default googleTrends;
}
