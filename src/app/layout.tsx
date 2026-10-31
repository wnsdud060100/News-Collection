import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import SignInGate from "@/components/sign-in-gate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "뉴스 카드",
  description: "AI가 요약하고 분류한 뉴스를 카드로 보여주는 앱",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html
        lang="ko"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <Suspense fallback={null}>
            <Show when="signed-in">
              <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
                <span className="text-lg font-extrabold tracking-tight text-blue-700 dark:text-blue-400">
                  뉴스 카드
                </span>
                <UserButton />
              </header>
              {children}
            </Show>
            <Show when="signed-out">
              <SignInGate />
            </Show>
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
