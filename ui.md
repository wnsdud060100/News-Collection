# UI 가이드 — News Collection

뉴스를 카드 형태로 보여 주는 대시보드 앱의 UI 가이드. 스타일링은 **Tailwind CSS 4** 유틸리티 클래스로만 작성한다(별도 CSS 파일은 `globals.css`의 토큰만 사용).

> 현재 코드의 앱 이름은 "뉴스 카드"다. 이 문서 기준 이름은 **News Collection**이므로 `layout.tsx`의 `metadata.title`, 헤더 로고 텍스트, `sign-in-gate.tsx` 제목을 이 이름으로 맞춘다.

## 1. 디자인 원칙

- **깔끔하게**: 장식을 줄이고 여백과 정렬로 구조를 만든다. 그림자는 약하게, 테두리는 옅게.
- **읽기 편하게**: 본문은 `leading-relaxed`, 제목은 굵게. 한 카드에서 시선이 제목 → 요약 → 메타 순서로 흐르게 한다.
- **한 가지 강조색**: 파랑 계열 하나만 강조(활성 탭, 링크, 카테고리 배지). 나머지는 slate 무채색.
- **다크 모드 대응**: 모든 색 클래스에 `dark:` 짝을 둔다(시스템 설정 `prefers-color-scheme` 기준).

## 2. 화면 구조

```
┌──────────────────────────────────────────────┐
│ News Collection                    [UserButton]│  헤더
├──────────────────────────────────────────────┤
│ 오늘의 뉴스                                    │  페이지 제목
│ AI가 요약하고 분류한 뉴스를 카드로 모아봤어요.   │
│                                              │
│ (전체) 한국경제(경제)  한국경제(IT)  더케이뷰티사이언스(화장품)  기타                   │  카테고리 탭 ← 카드 목록 위
│                                              │
│ ┌────────┐ ┌────────┐ ┌────────┐             │
│ │ 카드    │ │ 카드    │ │ 카드    │             │  카드 그리드
│ └────────┘ └────────┘ └────────┘             │
└──────────────────────────────────────────────┘
```

- 콘텐츠 컨테이너: `mx-auto w-full max-w-5xl px-4` (헤더와 본문 동일)
- 본문 세로 간격: `flex flex-col gap-6`, 하단 여백 `pb-16`
- 카테고리 탭은 **항상 카드 목록 바로 위**에 둔다.

## 3. 색상

| 용도 | 라이트 | 다크 |
|---|---|---|
| 페이지 배경 | `--background` `#f5f9ff` | `#0b1220` |
| 기본 글자 | `--foreground` `#0f172a` | `#e2e8f0` |
| 카드 배경 | `bg-white` | `dark:bg-slate-900` |
| 카드 테두리 | `border-blue-100` | `dark:border-slate-800` |
| 제목 글자 | `text-slate-900` | `dark:text-slate-50` |
| 본문(요약) 글자 | `text-slate-600` | `dark:text-slate-300` |
| 보조(메타) 글자 | `text-slate-500` | `dark:text-slate-400` |
| 강조(링크·로고) | `text-blue-600` / `text-blue-700` | `dark:text-blue-400` |
| 활성 탭 | `bg-blue-600 text-white` | 동일 |

색은 위 표의 조합만 쓴다. 새 색이 필요하면 먼저 이 표에 추가한다.

## 4. 타이포그래피

- 폰트: Geist + 한글 폴백(`Apple SD Gothic Neo`, `Malgun Gothic`, `Noto Sans KR`) — `--font-sans`로 `body`에 적용됨.
- 크기 체계:

| 요소 | 클래스 |
|---|---|
| 페이지 제목(h1) | `text-2xl font-bold sm:text-3xl` |
| 페이지 설명 | `text-sm` + 보조 글자색 |
| 카드 제목(h2) | `text-lg leading-snug font-bold` |
| 카드 요약 | `text-sm leading-relaxed` |
| 메타(출처·날짜) | `text-xs` |
| 로고 | `text-lg font-extrabold tracking-tight` |

## 5. 컴포넌트

### 5.1 헤더
- 좌측 로고 텍스트 "News Collection": `text-lg font-extrabold tracking-tight text-blue-700 dark:text-blue-400`
- 우측 Clerk `UserButton`
- 레이아웃: `flex items-center justify-between py-5`

### 5.2 카테고리 탭 (`components/category-tabs.tsx`)
- 첫 항목은 항상 **전체**, 이어서 DB 카테고리 순서대로 나열.
- 알약(pill) 모양: `rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition`
- 활성: `bg-blue-600 text-white shadow-sm` + `aria-current="page"`
- 비활성: `bg-white text-slate-600 ring-1 ring-blue-100 hover:bg-blue-50 hover:text-blue-700` (다크: `dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800`)
- 좁은 화면에서는 줄바꿈 대신 가로 스크롤: `<nav class="-mx-4 overflow-x-auto px-4 pb-1">`
- 선택 상태는 URL 쿼리(`/?category={id}`)로 표현한다. 존재하지 않는 값은 "전체"로 취급.

### 5.3 뉴스 카드 (`components/news-card.tsx`)
구성 순서(위 → 아래):
1. **상단 줄**: 카테고리 배지(좌) · 출처(우, `truncate`)
2. **제목** (h2)
3. **요약** (`flex-1`로 남는 높이를 채워 하단 줄을 카드 바닥에 정렬)
4. **하단 줄**(위에 구분선): 발행일시(좌) · "원문 보기 →" 링크(우)

컨테이너: `flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md` (+ 다크 짝)

카테고리 배지: `rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300`

하단 구분선: `border-t border-slate-100 pt-3 dark:border-slate-800`

규칙:
- 발행일은 `Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul" })`로 표시, 값이 없으면 "날짜 정보 없음". `<time dateTime>` 사용.
- 원문 링크는 `target="_blank" rel="noopener noreferrer"`.
- 카드 전체를 링크로 만들지 않는다(원문 링크와 후속 버튼이 분리되어야 함).
- 이후 추가될 **Notion 저장** 버튼은 하단 줄 우측, 원문 링크 옆에 둔다. 저장 완료 시 "저장됨"(비활성 스타일)로 바꾼다.

### 5.4 카드 그리드
- `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`
- 모바일 1열 → 태블릿 2열 → 데스크톱 3열.

### 5.5 상태 화면
- **빈 상태**: `rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 py-16 text-center text-sm text-slate-500` (다크: `dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400`). 문구 예: "아직 표시할 뉴스가 없어요."
- **로딩(스켈레톤)**: 실제 레이아웃과 같은 모양의 `animate-pulse` 블록. 탭은 `h-9 w-16 rounded-full bg-blue-100`, 카드는 `h-52 rounded-2xl bg-blue-50` (다크: `bg-slate-800` / `bg-slate-900`).
- **오류**: 빈 상태와 같은 박스에 빨강 계열(`border-red-200 bg-red-50 text-red-700`, 다크 `dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300`)을 쓰고, 재시도 버튼을 함께 둔다.

### 5.6 버튼 (공통, 추가 예정 기능용)
- 주요: `rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50`
- 보조: 탭 비활성 스타일과 동일(흰 배경 + `ring-1 ring-blue-100`)
- 진행 중에는 `disabled` + 라벨 변경("가져오는 중…") 으로 로딩을 표현한다.

## 6. 간격·모서리·그림자

- 간격은 4의 배수 스케일만 사용: 카드 내부 `gap-3`/`p-5`, 카드 사이 `gap-4`, 섹션 사이 `gap-6`.
- 모서리: 카드 `rounded-2xl`, 탭·배지·버튼 `rounded-full`.
- 그림자: 기본 `shadow-sm`, 호버 시 `shadow-md`까지만. 더 큰 그림자는 쓰지 않는다.

## 7. 접근성

- 탭은 `<nav aria-label="카테고리">` 안의 링크 목록, 활성 항목에 `aria-current="page"`.
- 카드는 `<article>`, 제목은 `h2`(페이지 `h1` 아래 위계 유지).
- 본문·메타 글자는 배경 대비 4.5:1 이상 유지(메타 최소 `slate-500`).
- 스켈레톤 등 장식 요소에는 `aria-hidden`.
- 키보드 포커스가 보이도록 `outline`을 제거하지 않는다.

## 8. 작성 규칙

- 스타일은 JSX의 `className`에 Tailwind 유틸리티로 직접 쓴다. 반복되는 조건부 클래스는 `tabClass()`처럼 작은 함수로 뽑는다.
- 임의 값(`w-[137px]`) 대신 Tailwind 스케일을 쓴다.
- 새 컴포넌트도 라이트/다크, 모바일/데스크톱 네 경우를 모두 확인한 뒤 완료로 본다.
