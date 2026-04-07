"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleDemoMode } from "@/lib/demo-data";

export function Footer() {
  const [showDemo, setShowDemo] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleDemo = async (role: "advertiser" | "influencer") => {
    setLoading(role);
    const ok = await toggleDemoMode(role);
    if (ok) {
      window.location.href = role === "advertiser" ? "/advertiser" : "/influencer";
      return;
    }
    setLoading(null);
  };

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">애드루민 리뷰</h3>
            <p className="text-sm text-muted-foreground">
              광고주와 인플루언서를 연결하는
              <br />
              캠페인 마케팅 플랫폼
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">서비스</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/campaigns" className="hover:text-foreground">
                  캠페인 찾기
                </Link>
              </li>
              <li>
                <Link
                  href="/register/advertiser"
                  className="hover:text-foreground"
                >
                  광고주 등록
                </Link>
              </li>
              <li>
                <Link
                  href="/register/influencer"
                  className="hover:text-foreground"
                >
                  인플루언서 등록
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">고객지원</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/faq" className="hover:text-foreground">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground">
                  서비스 소개
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground relative">
          &copy; {new Date().getFullYear()}{" "}ADLUMIN &middot; All rights
          reserved. |{" "}
          <span className="relative inline-block">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              플랫폼 제작 &middot; 꿈식판 꿈식맨
            </button>
            {showDemo && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 min-w-[240px] z-50">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleDemo("advertiser")}
                    disabled={loading !== null}
                    className="text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 text-gray-700"
                  >
                    {loading === "advertiser" ? "접속 중..." : "광고주로 체험하기"}
                  </button>
                  <button
                    onClick={() => handleDemo("influencer")}
                    disabled={loading !== null}
                    className="text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 text-gray-700"
                  >
                    {loading === "influencer" ? "접속 중..." : "인플루언서로 체험하기"}
                  </button>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-white border-r border-b border-gray-200" />
              </div>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
