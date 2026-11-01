import * as cheerio from "cheerio";
import { FEEDS } from "@/lib/rss/feeds";

const FETCH_TIMEOUT_MS = 8_000;
const BODY_MAX_CHARS = 3_000;

// 요약용으로만 임시로 가져온다. 본문은 DB에 저장하지 않는다.
const ALLOWED_HOSTS = new Set(FEEDS.map((f) => new URL(f.url).hostname));

// 사이트별 본문 영역 선택자 (앞에 있을수록 우선)
const BODY_SELECTORS = [
  "#articletxt", // 한국경제
  ".article-body",
  "#article-view-content-div", // KBS
  "[itemprop=articleBody]",
];

export type ArticleSource = {
  // 본문 추출에 성공하면 본문, 실패하면 og:description, 둘 다 없으면 null
  text: string | null;
  kind: "body" | "description" | "none";
};

function isAllowedUrl(link: string): boolean {
  try {
    const url = new URL(link);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export async function fetchArticleSource(link: string): Promise<ArticleSource> {
  if (!isAllowedUrl(link)) return { text: null, kind: "none" };

  try {
    const res = await fetch(link, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsCollection/1.0)" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) return { text: null, kind: "none" };

    const $ = cheerio.load(await res.text());

    for (const selector of BODY_SELECTORS) {
      const node = $(selector).first();
      if (node.length === 0) continue;
      node.find("script, style, noscript, iframe, figure, figcaption, aside, button").remove();
      const body = normalize(node.text());
      // 너무 짧으면 본문 추출 실패로 보고 다음 후보를 시도한다
      if (body.length >= 100) {
        return { text: body.slice(0, BODY_MAX_CHARS), kind: "body" };
      }
    }

    const description = normalize(
      $('meta[property="og:description"]').attr("content") ?? "",
    );
    if (description) return { text: description, kind: "description" };
  } catch {
    // 네트워크 오류·타임아웃은 제목만으로 요약하도록 폴백
  }
  return { text: null, kind: "none" };
}
