import { auth } from "@clerk/nextjs/server";
import { saveNewArticles } from "@/lib/news";
import { fetchRecentArticles } from "@/lib/rss/fetch-feeds";

export const maxDuration = 60;

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { items, failedFeeds } = await fetchRecentArticles();
    const inserted = await saveNewArticles(items);
    return Response.json({ fetched: items.length, inserted, failedFeeds });
  } catch (e) {
    console.error("[news/fetch]", e);
    return Response.json(
      { error: "뉴스를 저장하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
