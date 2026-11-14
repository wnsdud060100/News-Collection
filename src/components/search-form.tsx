type SearchFormProps = {
  basePath: string;
  query?: string;
  // 검색 시 유지할 카테고리
  categoryId?: number;
};

// GET 폼이라 '검색' 버튼 클릭과 Enter 키 모두 같은 방식으로 /?q=...로 이동한다.
export default function SearchForm({
  basePath,
  query,
  categoryId,
}: SearchFormProps) {
  return (
    <form
      action={basePath}
      method="get"
      role="search"
      aria-label="뉴스 검색"
      className="flex gap-2 sm:w-72 sm:shrink-0"
    >
      {categoryId !== undefined && (
        <input type="hidden" name="category" value={categoryId} />
      )}
      <input
        type="search"
        name="q"
        defaultValue={query ?? ""}
        placeholder="키워드로 뉴스 검색"
        aria-label="검색어"
        maxLength={100}
        className="min-w-0 flex-1 rounded-full bg-white px-4 py-2 text-sm text-slate-900 ring-1 ring-blue-100 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:bg-slate-900 dark:text-slate-50 dark:ring-slate-800 dark:placeholder:text-slate-400"
      />
      <button
        type="submit"
        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium whitespace-nowrap text-white hover:bg-blue-700"
      >
        검색
      </button>
    </form>
  );
}
