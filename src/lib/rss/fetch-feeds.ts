import { FEEDS, type FeedConfig } from "./feeds";
import { parseFeed, type ParsedItem } from "./parse";

const FETCH_TIMEOUT_MS = 10_000;
const WINDOW_MS = 24 * 60 * 60 * 1000;

export type FailedFeed = { source: string; error: string };

export type FetchFeedsResult = {
  items: ParsedItem[];
  failedFeeds: FailedFeed[];
};

async function fetchOne(feed: FeedConfig): Promise<ParsedItem[]> {
  const res = await fetch(feed.url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsCollection/1.0)" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const items = parseFeed(await res.text(), feed);
  if (items.length === 0) throw new Error("기사를 찾지 못했습니다");
  return items;
}

// 3개 피드를 병렬로 수집하고, 지난 24시간 안에 발행된 기사만 반환한다.
// 한 피드가 실패해도 나머지는 계속 진행하고 실패 목록에 담는다.
export async function fetchRecentArticles(
  now = new Date(),
): Promise<FetchFeedsResult> {
  const settled = await Promise.allSettled(FEEDS.map(fetchOne));
  const since = now.getTime() - WINDOW_MS;

  const items: ParsedItem[] = [];
  const failedFeeds: FailedFeed[] = [];

  settled.forEach((result, i) => {
    if (result.status === "rejected") {
      const reason = result.reason;
      failedFeeds.push({
        source: FEEDS[i].source,
        error: reason instanceof Error ? reason.message : String(reason),
      });
      return;
    }
    for (const item of result.value) {
      if (item.publishedAt && item.publishedAt.getTime() >= since) {
        items.push(item);
      }
    }
  });

  return { items, failedFeeds };
}
