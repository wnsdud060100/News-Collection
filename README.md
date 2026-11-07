# News Collection

RSS 뉴스를 모아 Gemini로 3줄 요약하고, 카테고리별 카드로 보여주는 뉴스 요약 앱입니다. 마음에 드는 기사는 Notion 데이터베이스에 저장할 수 있습니다.

## 주요 기능

- **뉴스 가져오기**: 버튼을 누를 때만 동작합니다(스케줄러 없음). 3개 피드에서 최근 24시간 기사를 수집하고, 이미 저장된 `link`는 건너뜁니다.
- **AI 요약**: 새 기사의 원문 본문을 가져와 Gemini로 3줄 요약합니다. 실패한 기사는 `summary = null`로 남고 다음 실행 때 다시 시도합니다. 본문은 저장하지 않습니다.
- **자동 분류**: AI 없이 출처 피드로 카테고리를 정합니다.
- **카드 목록**: 상단 탭(전체 + 카테고리)으로 필터링합니다. 카드에는 발행일, 제목, 요약, 원문 링크, 'Notion 저장' 버튼이 있습니다.
- **Notion 저장**: 기사 한 건을 Notion 데이터베이스에 페이지로 저장합니다. 이미 저장한 기사는 '저장됨'으로 표시됩니다.
- **인증**: 모든 페이지와 API는 Clerk 로그인이 필요합니다.

### 수집 피드와 카테고리

| 피드 | URL | 카테고리 |
| --- | --- | --- |
| 한국경제 경제 | `https://www.hankyung.com/feed/economy` | 한국경제(경제) |
| 한국경제 IT | `https://www.hankyung.com/feed/it` | 한국경제(IT) |
| THE K BEAUTY SCIENCE | `https://www.thekbs.co.kr/rss/allArticle.xml` | 더케이뷰티사이언스(화장품) |

피드 하나가 실패해도 나머지는 계속 수집하며, 실패한 피드는 화면에 표시합니다. 매핑된 카테고리가 DB에 없으면 카테고리 없이 저장되고 '전체' 탭에서만 보입니다.

## 기술 스택

- [Next.js](https://nextjs.org) 16 (App Router) · React 19 · TypeScript
- Tailwind CSS 4
- [Clerk](https://clerk.com) (인증)
- [Neon](https://neon.tech) Postgres + [Drizzle ORM](https://orm.drizzle.team)
- [Gemini API](https://ai.google.dev) (`@google/genai`) — 요약
- `fast-xml-parser`, `cheerio` — RSS 파싱과 본문 추출
- Notion API — 기사 저장

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경 변수

프로젝트 루트에 `.env.local`을 만들고 아래 값을 채웁니다.

```bash
# Clerk (https://dashboard.clerk.com → API Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Neon (https://console.neon.tech → Connection Details, pooled connection string)
DATABASE_URL=

# Gemini (https://aistudio.google.com → Get API key)
GEMINI_API_KEY=

# Notion
NOTION_API_TOKEN=
NOTION_DATABASE_ID=
```

API 키와 토큰은 서버에서만 사용하며 클라이언트에 노출하지 않습니다.

### 3. Notion 데이터베이스 준비

저장 대상 데이터베이스를 만들고 해당 Notion 통합(integration)에 연결한 뒤, 아래 속성을 정확히 같은 이름으로 추가합니다.

| 속성 | 타입 |
| --- | --- |
| 제목 | 제목(title) |
| 요약 | 텍스트(rich_text) |
| 출처 | URL |
| 카테고리 | 선택(select) |
| 날짜 | 날짜(date) |

`NOTION_DATABASE_ID`에는 데이터베이스 id 또는 URL을 그대로 넣어도 됩니다.

### 4. 데이터베이스 마이그레이션과 시드

```bash
npm run db:migrate   # 스키마 적용
npm run db:seed      # 기본 카테고리 3개 생성
```

### 5. 개발 서버

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 로그인한 뒤 '뉴스 가져오기'를 눌러 사용합니다.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint |
| `npm run db:generate` | Drizzle 마이그레이션 생성 |
| `npm run db:migrate` | 마이그레이션 적용 |
| `npm run db:studio` | Drizzle Studio |
| `npm run db:seed` | 기본 카테고리 시드 |

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx, dashboard/        # 페이지
│   └── api/news/
│       ├── fetch/                  # RSS 수집
│       ├── summarize/              # 대기 중인 기사 요약
│       └── save/                   # Notion 저장
├── components/                     # 뉴스 카드, 카테고리 탭, 버튼 등
├── db/                             # Drizzle 스키마, 연결, 시드
├── lib/
│   ├── rss/                        # 피드 정의, 수집, 파싱
│   ├── summary/                    # 본문 추출, Gemini 요약
│   ├── news.ts                     # 기사 조회
│   └── notion.ts                   # Notion 페이지 생성
└── proxy.ts                        # Clerk 인증
drizzle/                            # 마이그레이션 SQL
```

## 문서

- [`PRD.md`](./PRD.md) — 제품 요구사항 (기준 문서)
- [`ui.md`](./ui.md) — UI·스타일 가이드
- [`CLAUDE.md`](./CLAUDE.md) — Claude Code 작업 지침
