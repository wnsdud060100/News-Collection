"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteNewsButton({ articleId }: { articleId: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!window.confirm("이 뉴스를 삭제할까요?")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/news/${articleId}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "삭제하지 못했어요.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제하지 못했어요.");
      setDeleting(false);
    }
  }

  return (
    <>
      {error && (
        <span role="alert" className="text-xs text-red-700 dark:text-red-300">
          {error}
        </span>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={deleting}
        aria-label="뉴스 삭제"
        title="뉴스 삭제"
        className="flex size-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
      >
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>
    </>
  );
}
