import { and, count, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { fetchArticleSource } from "./extract";
import { summarizeArticles } from "./gemini";

// 한 번 호출에서 처리할 기사 수 (라우트 최대 실행 시간 안에 끝나도록 제한)
const BATCH_SIZE = 10;
const PAGE_CONCURRENCY = 5;

export type SummarizeResult = {
  processed: number; // 이번에 시도한 기사 수
  summarized: number; // 요약이 저장된 기사 수
  remaining: number; // 아직 요약이 없는 기사 수
};

async function countPending(): Promise<number> {
  const [{ value }] = await db
    .select({ value: count() })
    .from(articles)
    .where(isNull(articles.summary));
  return value;
}

// summary가 null인 기사를 최신순으로 BATCH_SIZE건 꺼내 요약한다.
// 요약에 실패한 기사는 null로 남아 다음 실행에서 다시 시도된다.
export async function summarizePending(): Promise<SummarizeResult> {
  const pending = await db
    .select({ id: articles.id, title: articles.title, link: articles.link })
    .from(articles)
    .where(isNull(articles.summary))
    .orderBy(sql`${articles.publishedAt} desc nulls last`, desc(articles.id))
    .limit(BATCH_SIZE);

  if (pending.length === 0) return { processed: 0, summarized: 0, remaining: 0 };

  // 원문 페이지는 동시 요청 수를 제한해서 가져온다 (본문은 저장하지 않는다)
  const inputs: { id: number; title: string; text: string | null }[] = [];
  for (let i = 0; i < pending.length; i += PAGE_CONCURRENCY) {
    const chunk = pending.slice(i, i + PAGE_CONCURRENCY);
    const sources = await Promise.all(
      chunk.map((a) => fetchArticleSource(a.link)),
    );
    chunk.forEach((a, j) =>
      inputs.push({ id: a.id, title: a.title, text: sources[j].text }),
    );
  }

  const summaries = await summarizeArticles(inputs);

  await Promise.all(
    [...summaries].map(([id, summary]) =>
      db
        .update(articles)
        .set({ summary })
        .where(and(eq(articles.id, id), isNull(articles.summary))),
    ),
  );

  return {
    processed: pending.length,
    summarized: summaries.size,
    remaining: await countPending(),
  };
}
