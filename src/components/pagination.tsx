import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  // 페이지 이동 시 유지할 쿼리(예: category)
  query?: Record<string, string | undefined>;
};

function pageHref(
  basePath: string,
  page: number,
  query: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

// 1 … 4 5 [6] 7 8 … 20 처럼 현재 페이지 주변만 보여준다.
function pageItems(current: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

function pageClass(active: boolean) {
  return `inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium whitespace-nowrap transition ${
    active
      ? "bg-blue-600 text-white shadow-sm"
      : "bg-white text-slate-600 ring-1 ring-blue-100 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
  }`;
}

const disabledClass =
  "inline-flex h-9 items-center justify-center rounded-full px-3 text-sm font-medium text-slate-500 opacity-50 ring-1 ring-blue-100 dark:text-slate-400 dark:ring-slate-800";

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  query = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="페이지"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {currentPage > 1 ? (
        <Link
          href={pageHref(basePath, currentPage - 1, query)}
          className={pageClass(false)}
        >
          이전
        </Link>
      ) : (
        <span aria-disabled className={disabledClass}>
          이전
        </span>
      )}

      {pageItems(currentPage, totalPages).map((item, i) =>
        item === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="px-1 text-sm text-slate-500 dark:text-slate-400"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={pageHref(basePath, item, query)}
            aria-current={item === currentPage ? "page" : undefined}
            className={pageClass(item === currentPage)}
          >
            {item}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={pageHref(basePath, currentPage + 1, query)}
          className={pageClass(false)}
        >
          다음
        </Link>
      ) : (
        <span aria-disabled className={disabledClass}>
          다음
        </span>
      )}
    </nav>
  );
}
