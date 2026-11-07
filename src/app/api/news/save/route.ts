import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories, notionSaves } from "@/db/schema";
import { createNewsPage, NotionConfigError } from "@/lib/notion";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const articleId = Number(body?.articleId);
  if (!Number.isInteger(articleId) || articleId <= 0) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const [article] = await db
    .select({
      title: articles.title,
      summary: articles.summary,
      link: articles.link,
      publishedAt: articles.publishedAt,
      category: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.id, articleId));
  if (!article) {
    return Response.json({ error: "기사를 찾을 수 없어요." }, { status: 404 });
  }

  // 같은 사용자가 같은 기사를 두 번 저장하지 않는다.
  try {
    const [alreadySaved] = await db
      .select({ id: notionSaves.id })
      .from(notionSaves)
      .where(
        and(eq(notionSaves.clerkUserId, userId), eq(notionSaves.articleId, articleId)),
      );
    if (alreadySaved) return Response.json({ saved: true, duplicate: true });

    const notionPageId = await createNewsPage(article);
    await db
      .insert(notionSaves)
      .values({ clerkUserId: userId, articleId, notionPageId })
      .onConflictDoNothing();
    return Response.json({ saved: true });
  } catch (e) {
    console.error("[news/save]", e);
    const message =
      e instanceof NotionConfigError
        ? e.message
        : "Notion에 저장하지 못했어요. 잠시 후 다시 시도해 주세요.";
    return Response.json({ error: message }, { status: 500 });
  }
}
