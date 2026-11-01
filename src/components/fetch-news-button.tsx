"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FetchResult = {
  fetched: number;
  inserted: number;
  failedFeeds: { source: string; error: string }[];
};

type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "done"; result: FetchResult }
  | { type: "error"; message: string };

export default function FetchNewsButton() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const loading = status.type === "loading";

  async function handleClick() {
    setStatus({ type: "loading" });
    try {
      const res = await fetch("/api/news/fetch", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "뉴스를 가져오지 못했어요.");
      }
      setStatus({ type: "done", result: data });
      router.refresh();
    } catch (e) {
      setStatus({
        type: "error",
        message: e instanceof Error ? e.message : "뉴스를 가져오지 못했어요.",
      });
    }
  }

  return (
    <div className="flex flex-col items-start gap-3 sm:items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "가져오는 중…" : "뉴스 가져오기"}
      </button>

      <div aria-live="polite" className="text-sm">
        {status.type === "done" && (
          <p className="text-slate-600 dark:text-slate-300">
            {status.result.inserted > 0
              ? `새 기사 ${status.result.inserted}건을 저장했어요.`
              : "새로 저장할 기사가 없어요."}
          </p>
        )}
        {status.type === "done" && status.result.failedFeeds.length > 0 && (
          <p className="mt-1 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            가져오지 못한 피드:{" "}
            {status.result.failedFeeds
              .map((f) => `${f.source} (${f.error})`)
              .join(", ")}
          </p>
        )}
        {status.type === "error" && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}
