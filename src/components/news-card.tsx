type NewsCardProps = {
  title: string;
  source: string;
  link: string;
  summary: string;
  publishedAt: Date | null;
  categoryName: string;
};

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function NewsCard({
  title,
  source,
  link,
  summary,
  publishedAt,
  categoryName,
}: NewsCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
          {categoryName}
        </span>
        <span className="truncate text-xs text-slate-500 dark:text-slate-400">
          {source}
        </span>
      </div>

      <h2 className="text-lg leading-snug font-bold text-slate-900 dark:text-slate-50">
        {title}
      </h2>

      <p className="flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {summary}
      </p>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
        <time
          dateTime={publishedAt?.toISOString()}
          className="text-xs text-slate-500 dark:text-slate-400"
        >
          {publishedAt ? dateFormat.format(publishedAt) : "날짜 정보 없음"}
        </time>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          원문 보기 →
        </a>
      </div>
    </article>
  );
}
