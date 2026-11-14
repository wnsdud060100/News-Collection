import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import type { ReactNode } from "react";

// 왼쪽: 로고(두 줄 높이), 오른쪽: 프로필 버튼 + 그 아래 페이지별 액션(children)
export default function PageHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-4 pt-5">
      <Link
        href="/dashboard"
        className="text-3xl leading-none font-black tracking-tighter text-blue-700 sm:text-4xl dark:text-blue-400"
      >
        News Collection
      </Link>
      <div className="flex flex-col items-end gap-3">
        <UserButton />
        {children}
      </div>
    </header>
  );
}
