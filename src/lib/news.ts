import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories, notionSaves } from "@/db/schema";
import { FEEDS } from "@/lib/rss/feeds";
import type { ParsedItem } from "@/lib/rss/parse";

const PAGE_LIMIT = 60;

export async function getCategories() {
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.id));
}

export async function getArticles(categoryId?: number) {
  const query = db
    .select({
      id: articles.id,
      source: articles.source,
      title: articles.title,
      link: articles.link,
      summary: articles.summary,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .$dynamic();

  if (categoryId !== undefined) query.where(eq(articles.categoryId, categoryId));

  return query
    .orderBy(desc(articles.publishedAt), desc(articles.id))
    .limit(PAGE_LIMIT);
}

// 해당 사용자가 이미 Notion에 저장한 기사 id 집합
export async function getSavedArticleIds(
  userId: string | null,
  articleIds: number[],
): Promise<Set<number>> {
  if (!userId || articleIds.length === 0) return new Set();
  const rows = await db
    .select({ articleId: notionSaves.articleId })
    .from(notionSaves)
    .where(
      and(
        eq(notionSaves.clerkUserId, userId),
        inArray(notionSaves.articleId, articleIds),
      ),
    );
  return new Set(rows.map((r) => r.articleId));
}

export const DASHBOARD_PAGE_SIZE = 9;

// 대시보드용: 발행일 최신순(발행일이 없으면 맨 뒤), 같으면 수집 시각 최신순.
// 요청한 페이지가 범위를 벗어나면 가장 가까운 유효 페이지로 보정해 돌려준다.
export async function getLatestArticles(categoryId?: number, page = 1) {
  const where =
    categoryId !== undefined ? eq(articles.categoryId, categoryId) : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(articles)
    .where(where);

  const totalPages = Math.max(1, Math.ceil(total / DASHBOARD_PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const items = await db
    .select({
      id: articles.id,
      source: articles.source,
      title: articles.title,
      link: articles.link,
      summary: articles.summary,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(where)
    .orderBy(
      sql`${articles.publishedAt} desc nulls last`,
      desc(articles.fetchedAt),
      desc(articles.id),
    )
    .limit(DASHBOARD_PAGE_SIZE)
    .offset((currentPage - 1) * DASHBOARD_PAGE_SIZE);

  return { items, total, totalPages, currentPage };
}

// 피드(출처)별 카테고리 이름. 대응하는 카테고리가 DB에 없으면 카테고리 없음(null)으로 저장한다.
const CATEGORY_BY_SOURCE = new Map(FEEDS.map((f) => [f.source, f.category]));

// 수집한 기사를 저장한다. link가 이미 있으면 건너뛰고, 새로 저장된 건수를 반환한다.
// 카테고리는 AI 없이, 기사를 가져온 피드에 따라 정한다.
export async function saveNewArticles(items: ParsedItem[]): Promise<number> {
  const unique = [...new Map(items.map((i) => [i.link, i])).values()];
  if (unique.length === 0) return 0;

  const allCategories = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories);
  const idByName = new Map(allCategories.map((c) => [c.name, c.id]));

  const inserted = await db
    .insert(articles)
    .values(
      unique.map((i) => ({
        ...i,
        categoryId: idByName.get(CATEGORY_BY_SOURCE.get(i.source) ?? "") ?? null,
      })),
    )
    .onConflictDoNothing({ target: articles.link })
    .returning({ id: articles.id });

  return inserted.length;
}
