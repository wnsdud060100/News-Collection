# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Fresh `create-next-app` scaffold (Next.js 16.4.3, React 19, Tailwind 4, TypeScript, App Router, `src/` dir, alias `@/*` → `src/*`). No app code yet. `PRD.md` (Korean) is the source of truth; this file summarizes it. If they conflict, PRD.md wins.

## UI guide

`ui.md` (Korean) is the UI/styling guide (app name "News Collection", Tailwind CSS, colors, typography, component specs, dark mode). Read it before writing or changing any UI, and follow it for new components.

## Commands

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # production build
npm run lint    # eslint (flat config, eslint.config.mjs)
```

No test runner is configured yet.

## Next.js version caveat

`AGENTS.md` warns that this Next.js version has breaking changes versus common training data. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices (e.g. middleware/auth conventions, route max duration config).

## Product (PRD.md)

News summary card app. On button click only (no scheduler), fetch RSS feeds, summarize + categorize new articles with the Claude API, store them, and show category-filtered cards. Users can save cards to their own Notion.

**Feeds:**
- Hankyung economy — `https://www.hankyung.com/feed/economy`
- Hankyung IT — `https://www.hankyung.com/feed/it`
- KBS all articles — `https://www.thekbs.co.kr/rss/allArticle.xml`

RSS field structure (summary field, encoding, date format) is unverified — inspect each feed before writing the parser.

**Out of scope:** automatic scheduled fetch, multiple categories per article, per-user categories / admin roles, full article body storage or origin crawling.

## Stack

Clerk (auth) · Neon Postgres + Drizzle ORM · Claude API · Notion MCP server with per-user OAuth.

## Behavior rules

- **Auth:** every page and API route requires Clerk login (unauthenticated → sign-in); check auth in every API route. News and categories are shared by all users; only Notion connections are per-user.
- **Fetch ('뉴스 가져오기'):** collect all 3 feeds, skip articles whose `link` already exists, send only new ones to Claude (batched, several articles per request). One feed failing must not stop the others; report failed feeds in the UI. Show loading state and the new-article count.
- **Classification:** based on current category names + descriptions. One category per article. No match, nonexistent category in the Claude response, or unparseable response → `기타`.
- **Categories:** default set 경제, IT, 화장품, 기타 (seeded). Add/edit(name, description)/delete allowed by any logged-in user. `기타` (`isDefault`) cannot be deleted. Deleting a category moves its articles to `기타`. Category edits never auto-reclassify; the manual '재분류' button reclassifies existing articles against the current categories.
- **Card:** title, source, published date, summary, category badge, origin link, 'Notion 저장' button (shows '저장됨' if already saved by this user). Top tabs: '전체' + each category.
- **Notion save:** per-user OAuth connect; if not connected, the save button sends the user to the connect flow. Page creation goes through the Notion MCP server (title, summary, source, category, link, published date). Same user cannot save the same article twice. Show errors on failure and allow retry. Save target (page vs database) is undecided — decide at implementation.

## Data model (draft)

- `categories`: id, name (unique), description, isDefault, createdAt
- `articles`: id, source, title, link (unique), summary, publishedAt, categoryId (FK), fetchedAt
- `notion_connections`: clerkUserId (unique), access/refresh tokens (encrypted), expiry, target page id
- `notion_saves`: clerkUserId, articleId, notionPageId, savedAt — unique(clerkUserId, articleId)

## Non-functional requirements

- **Security:** API keys and tokens are server-only; Notion tokens stored encrypted.
- **Cost:** only new articles go to Claude; batch multiple articles per call; reclassify is manual only.
- **Performance:** cap batch size for fetch/reclassify, show progress, set route max execution time.
- **Reliability:** isolate per-feed failures; fall back to `기타` on Claude parse failure.

## Implementation order

1. Next.js init, Clerk login + middleware
2. Neon + Drizzle schema/migration, default category seed
3. RSS fetch, Claude summarize/classify, '뉴스 가져오기' button
4. Card list UI + category filter
5. Category CRUD + reclassify button
6. Notion OAuth, MCP save, card button

The riskiest piece is Notion MCP per-user OAuth (auth flow, token refresh) — prototype it early.

## Acceptance checks (PRD §12)

- No page or API is reachable without login.
- Running fetch twice in a row creates no duplicates and reflects all 3 feeds.
- Cosmetics articles land in `화장품`; unrelated ones in `기타`.
- After category add/edit/delete, reclassify reflects the changes.
- After connecting Notion, saving creates a real page and blocks duplicates.
- Two different accounts save to their own separate Notions.
