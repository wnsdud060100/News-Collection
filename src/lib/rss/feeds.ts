export type FeedConfig = {
  source: string;
  url: string;
  // RSS pubDate에 타임존이 없는 피드의 기준 오프셋 (KBS는 KST)
  naiveDateOffset?: string;
};

export const FEEDS: FeedConfig[] = [
  { source: "한국경제 경제", url: "https://www.hankyung.com/feed/economy" },
  { source: "한국경제 IT", url: "https://www.hankyung.com/feed/it" },
  {
    source: "KBS",
    url: "https://www.thekbs.co.kr/rss/allArticle.xml",
    naiveDateOffset: "+09:00",
  },
];
