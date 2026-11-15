import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articleId = Number((await params).id);
  if (!Number.isInteger(articleId) || articleId <= 0) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  try {
    // notion_saves는 FK on delete cascade로 함께 정리된다.
    const deleted = await db
      .delete(articles)
      .where(eq(articles.id, articleId))
      .returning({ id: articles.id });
    if (deleted.length === 0) {
      return Response.json({ error: "기사를 찾을 수 없어요." }, { status: 404 });
    }
    return Response.json({ deleted: true });
  } catch (e) {
    console.error("[news/delete]", e);
    return Response.json(
      { error: "삭제하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
