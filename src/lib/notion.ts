import "server-only";

// Notion 데이터베이스 속성: 제목(title) · 요약(rich_text) · 출처(url) · 카테고리(select) · 날짜(date)
const NOTION_VERSION = "2022-06-28";
const RICH_TEXT_LIMIT = 2000;

export class NotionConfigError extends Error {}

export type NotionArticle = {
  title: string;
  summary: string | null;
  link: string;
  category: string | null;
  publishedAt: Date | null;
};

// 기사 한 건을 Notion 데이터베이스에 페이지로 저장하고 페이지 id를 돌려준다.
export async function createNewsPage(article: NotionArticle): Promise<string> {
  const token = process.env.NOTION_API_TOKEN;
  // URL을 그대로 붙여 넣어도 동작하도록 32자리 id만 추출한다(하이픈 유무 무관).
  const databaseId = process.env.NOTION_DATABASE_ID?.replace(/-/g, "").match(
    /[0-9a-f]{32}/i,
  )?.[0];
  if (!token || !databaseId) {
    throw new NotionConfigError(
      "NOTION_API_TOKEN 또는 NOTION_DATABASE_ID가 설정되지 않았어요.",
    );
  }

  const properties: Record<string, unknown> = {
    제목: { title: [{ text: { content: article.title.slice(0, RICH_TEXT_LIMIT) } }] },
    출처: { url: article.link },
  };
  if (article.summary) {
    properties["요약"] = {
      rich_text: [{ text: { content: article.summary.slice(0, RICH_TEXT_LIMIT) } }],
    };
  }
  if (article.category) properties["카테고리"] = { select: { name: article.category } };
  if (article.publishedAt) {
    properties["날짜"] = { date: { start: article.publishedAt.toISOString() } };
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(`Notion ${res.status}: ${body?.message ?? "저장 실패"}`);
  }
  const page = (await res.json()) as { id: string };
  return page.id;
}
