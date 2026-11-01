import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

const PAGE_LIMIT = 60;

export async function getCategories() {
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.isDefault), asc(categories.id));
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
      categoryName: categories.name,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .$dynamic();

  if (categoryId !== undefined) query.where(eq(articles.categoryId, categoryId));

  return query
    .orderBy(desc(articles.publishedAt), desc(articles.id))
    .limit(PAGE_LIMIT);
}

// 대시보드용: 발행일 최신순(발행일이 없으면 맨 뒤), 같으면 수집 시각 최신순
export async function getLatestArticles(categoryId?: number) {
  const query = db
    .select({
      id: articles.id,
      source: articles.source,
      title: articles.title,
      link: articles.link,
      summary: articles.summary,
      publishedAt: articles.publishedAt,
      categoryName: categories.name,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .$dynamic();

  if (categoryId !== undefined) query.where(eq(articles.categoryId, categoryId));

  return query
    .orderBy(
      sql`${articles.publishedAt} desc nulls last`,
      desc(articles.fetchedAt),
    )
    .limit(PAGE_LIMIT);
}
