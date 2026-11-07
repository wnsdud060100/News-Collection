"use client";

import { useState } from "react";

type Props = { articleId: number; initialSaved: boolean };

export default function SaveNewsButton({ articleId, initialSaved }: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/news/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "저장하지 못했어요.");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span role="alert" className="text-xs text-red-700 dark:text-red-300">
          {error}
        </span>
      )}
      {saved ? (
        <button
          type="button"
          disabled
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-500 ring-1 ring-blue-100 disabled:cursor-default dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800"
        >
          저장됨
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={saving}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "저장 중…" : error ? "다시 시도" : "뉴스 저장"}
        </button>
      )}
    </div>
  );
}
