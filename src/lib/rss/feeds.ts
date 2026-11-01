export type FeedConfig = {
  source: string;
  url: string;
  // 이 피드의 기사가 들어갈 카테고리 이름 (categories.name과 일치해야 함)
  category: string;
  // RSS pubDate에 타임존이 없는 피드의 기준 오프셋 (KBS는 KST)
  naiveDateOffset?: string;
};

export const FEEDS: FeedConfig[] = [
  { source: "한국경제 경제", url: "https://www.hankyung.com/feed/economy", category: "경제" },
  { source: "한국경제 IT", url: "https://www.hankyung.com/feed/it", category: "IT" },
  {
    source: "KBS",
    url: "https://www.thekbs.co.kr/rss/allArticle.xml",
    category: "화장품",
    naiveDateOffset: "+09:00",
  },
];
