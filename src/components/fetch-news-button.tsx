"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FetchResult = {
  fetched: number;
  inserted: number;
  failedFeeds: { source: string; error: string }[];
};

type SummarizeResult = {
  processed: number;
  summarized: number;
  remaining: number;
};

type Status =
  | { type: "idle" }
  | { type: "fetching" }
  | { type: "summarizing"; remaining: number }
  | {
      type: "done";
      result: FetchResult;
      summarized: number;
      remaining: number;
      summaryError?: string;
    }
  | { type: "error"; message: string };

async function post<T>(url: string, fallbackError: string): Promise<T> {
  const res = await fetch(url, { method: "POST" });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? fallbackError);
  return data as T;
}

export default function FetchNewsButton() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const loading = status.type === "fetching" || status.type === "summarizing";

  async function handleClick() {
    setStatus({ type: "fetching" });

    let result: FetchResult;
    try {
      result = await post<FetchResult>(
        "/api/news/fetch",
        "뉴스를 가져오지 못했어요.",
      );
    } catch (e) {
      setStatus({
        type: "error",
        message: e instanceof Error ? e.message : "뉴스를 가져오지 못했어요.",
      });
      return;
    }
    router.refresh();

    // 요약이 없는 기사를 소량씩 요약한다. 새 기사가 없어도 이전에 실패한 기사를 재시도한다.
    let summarized = 0;
    let remaining = 0;
    let summaryError: string | undefined;
    setStatus({ type: "summarizing", remaining: result.inserted });
    try {
      for (;;) {
        const batch = await post<SummarizeResult>(
          "/api/news/summarize",
          "요약을 만들지 못했어요.",
        );
        summarized += batch.summarized;
        remaining = batch.remaining;
        router.refresh();
        // 더 처리할 기사가 없거나, 이번 배치에서 하나도 못 만들었으면 멈춘다(무한 반복 방지)
        if (batch.remaining === 0 || batch.summarized === 0) break;
        setStatus({ type: "summarizing", remaining: batch.remaining });
      }
    } catch (e) {
      summaryError =
        e instanceof Error ? e.message : "요약을 만들지 못했어요.";
    }

    setStatus({ type: "done", result, summarized, remaining, summaryError });
  }

  return (
    <div className="flex flex-col items-start gap-3 sm:items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {status.type === "fetching" && "가져오는 중…"}
        {status.type === "summarizing" && "요약 중…"}
        {!loading && "뉴스 가져오기"}
      </button>

      <div aria-live="polite" className="text-sm">
        {status.type === "summarizing" && (
          <p className="text-slate-600 dark:text-slate-300">
            {status.remaining > 0
              ? `남은 기사 ${status.remaining}건을 요약하고 있어요.`
              : "요약할 기사를 확인하고 있어요."}
          </p>
        )}
        {status.type === "done" && (
          <p className="text-slate-600 dark:text-slate-300">
            {status.result.inserted > 0
              ? `새 기사 ${status.result.inserted}건을 저장했어요.`
              : "새로 저장할 기사가 없어요."}
            {status.summarized > 0 && ` ${status.summarized}건을 요약했어요.`}
            {status.remaining > 0 &&
              ` 요약 대기 ${status.remaining}건은 다시 누르면 이어서 처리해요.`}
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
        {status.type === "done" && status.summaryError && (
          <p className="mt-1 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {status.summaryError}
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
