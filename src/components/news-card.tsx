type NewsCardProps = {
  title: string;
  link: string;
  summary: string | null;
  publishedAt: Date | null;
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
  link,
  summary,
  publishedAt,
}: NewsCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50">
      <time
        dateTime={publishedAt?.toISOString()}
        className="self-end text-xs text-slate-500 dark:text-slate-400"
      >
        {publishedAt ? dateFormat.format(publishedAt) : "날짜 정보 없음"}
      </time>

      <h2 className="text-lg leading-snug font-bold text-slate-900 dark:text-slate-50">
        {title}
      </h2>

      <p className="flex-1 text-sm leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300">
        {summary ?? "아직 요약이 없어요."}
      </p>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
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
