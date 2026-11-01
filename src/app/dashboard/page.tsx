import { Suspense } from "react";
import CategoryTabs from "@/components/category-tabs";
import FetchNewsButton from "@/components/fetch-news-button";
import NewsCard from "@/components/news-card";
import Pagination from "@/components/pagination";
import { getCategories, getLatestArticles } from "@/lib/news";

// 로그인 게이트(layout.tsx) 뒤에서만 렌더링되므로 instant 검증에서 제외
export const instant = false;

export default function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-16">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-50">
            대시보드
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            가장 최근에 발행된 뉴스부터 보여드려요.
          </p>
        </div>
        <FetchNewsButton />
      </section>

      <Suspense fallback={<ListSkeleton />}>
        <Feed searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Feed({
  searchParams,
}: Pick<PageProps<"/dashboard">, "searchParams">) {
  const { category, page } = await searchParams;
  const categories = await getCategories();
  // 존재하지 않는 카테고리 값이면 '전체'로 취급
  const activeId = categories.find((c) => String(c.id) === category)?.id;
  // page가 숫자가 아니거나 1 미만이면 1페이지로 취급 (범위 초과는 쿼리에서 보정)
  const requestedPage = Math.max(1, Number.parseInt(String(page), 10) || 1);
  const { items, totalPages, currentPage } = await getLatestArticles(
    activeId,
    requestedPage,
  );

  return (
    <>
      <CategoryTabs
        categories={categories}
        activeId={activeId}
        basePath="/dashboard"
      />
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 py-16 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
          아직 표시할 뉴스가 없어요.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.id} {...item} />
          ))}
        </div>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/dashboard"
        query={{ category: activeId === undefined ? undefined : String(activeId) }}
      />
    </>
  );
}

function ListSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-6">
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-9 w-16 animate-pulse rounded-full bg-blue-100 dark:bg-slate-800"
          />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-52 animate-pulse rounded-2xl bg-blue-50 dark:bg-slate-900"
          />
        ))}
      </div>
    </div>
  );
}
