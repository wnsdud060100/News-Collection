"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

export default function SignInGate() {
  const { openSignIn } = useClerk();

  useEffect(() => {
    openSignIn();
  }, [openSignIn]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">뉴스 요약 카드</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        서비스를 이용하려면 로그인해 주세요.
      </p>
      <button
        type="button"
        onClick={() => openSignIn()}
        className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        로그인
      </button>
    </main>
  );
}
