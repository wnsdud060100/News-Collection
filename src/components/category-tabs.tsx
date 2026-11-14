import Link from "next/link";

type CategoryTabsProps = {
  categories: { id: number; name: string }[];
  activeId?: number;
  basePath?: string;
  // 탭 이동 시 유지할 검색어
  keyword?: string;
};

function tabClass(active: boolean) {
  return `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
    active
      ? "bg-blue-600 text-white shadow-sm"
      : "bg-white text-slate-600 ring-1 ring-blue-100 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
  }`;
}

function tabHref(basePath: string, categoryId?: number, keyword?: string) {
  const params = new URLSearchParams();
  if (categoryId !== undefined) params.set("category", String(categoryId));
  if (keyword) params.set("q", keyword);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function CategoryTabs({
  categories,
  activeId,
  basePath = "/",
  keyword,
}: CategoryTabsProps) {
  return (
    <nav aria-label="카테고리" className="-mx-4 -my-2 overflow-x-auto px-4 py-2 sm:-mx-2 sm:min-w-0 sm:flex-1 sm:px-2">
      <ul className="flex gap-2">
        <li>
          <Link
            href={tabHref(basePath, undefined, keyword)}
            aria-current={activeId === undefined ? "page" : undefined}
            className={tabClass(activeId === undefined)}
          >
            전체
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={tabHref(basePath, c.id, keyword)}
              aria-current={activeId === c.id ? "page" : undefined}
              className={tabClass(activeId === c.id)}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
