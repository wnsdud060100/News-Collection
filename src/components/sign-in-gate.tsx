"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// 서버가 계속 비로그인으로 보면 refresh가 무한 반복되므로 페이지 로드당 한 번만 한다
let refreshed = false;

export default function SignInGate() {
  const { openSignIn } = useClerk();
  const { isLoaded, isSignedIn } = useAuth();

  const router = useRouter();

  // 세션 확인이 끝나기 전이나 이미 로그인된 상태에서는 모달을 열지 않는다
  useEffect(() => {
    if (isLoaded && !isSignedIn) openSignIn();
  }, [isLoaded, isSignedIn, openSignIn]);

  // <Show>는 서버에서 렌더되므로, 클라이언트에서 로그인이 끝나면 서버 트리를 새로 받아야 한다
  useEffect(() => {
    if (isLoaded && isSignedIn && !refreshed) {
      refreshed = true;
      router.refresh();
    }
  }, [isLoaded, isSignedIn, router]);

  if (isSignedIn) return null;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">News Collection</h1>
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
