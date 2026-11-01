import { XMLParser } from "fast-xml-parser";
import type { FeedConfig } from "./feeds";

export type ParsedItem = {
  source: string;
  title: string;
  link: string;
  publishedAt: Date | null;
};

const parser = new XMLParser({
  ignoreAttributes: true,
  trimValues: true,
  // 항목이 1개여도 배열로 받는다
  isArray: (name) => name === "item",
});

// "2026-11-01 07:12:07" 처럼 타임존이 없는 형식
const NAIVE_DATE = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/;

function text(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDate(raw: string, offset = "Z"): Date | null {
  if (!raw) return null;
  const value = NAIVE_DATE.test(raw)
    ? `${raw.replace(" ", "T")}${offset}`
    : raw;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseFeed(xml: string, feed: FeedConfig): ParsedItem[] {
  const doc = parser.parse(xml);
  const items: unknown[] = doc?.rss?.channel?.item ?? [];

  const result: ParsedItem[] = [];
  for (const raw of items) {
    const item = raw as Record<string, unknown>;
    const title = stripHtml(text(item.title));
    const link = text(item.link);
    if (!title || !link) continue;

    result.push({
      source: feed.source,
      title,
      link,
      publishedAt: parseDate(text(item.pubDate), feed.naiveDateOffset),
    });
  }
  return result;
}
