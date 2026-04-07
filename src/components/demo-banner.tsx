"use client";

import { useAuth } from "@/providers/auth-provider";
import { useState } from "react";
import { toggleDemoMode, clearDemoMode } from "@/lib/demo-data";

export function DemoBanner() {
  const { isDemo } = useAuth();
  const [switching, setSwitching] = useState(false);

  if (!isDemo) return null;

  const currentRoleLabel = isDemo === "advertiser" ? "광고주" : "인플루언서";
  const otherRole: "advertiser" | "influencer" =
    isDemo === "advertiser" ? "influencer" : "advertiser";
  const otherRoleLabel = isDemo === "advertiser" ? "인플루언서" : "광고주";

  const handleSwitch = async () => {
    setSwitching(true);
    const ok = await toggleDemoMode(otherRole);
    if (ok) {
      // Full page reload to reset auth state
      window.location.href = otherRole === "advertiser" ? "/advertiser" : "/influencer";
    }
    setSwitching(false);
  };

  const handleExit = () => {
    clearDemoMode();
    window.location.href = "/";
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden">
      <div className="bg-amber-50 border border-amber-300 rounded-xl shadow-lg px-4 py-3 flex flex-col gap-2 min-w-[200px]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-sm font-semibold text-amber-800">
            샘플 모드
          </span>
          <span className="text-xs text-amber-600 ml-auto">
            {currentRoleLabel}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSwitch}
            disabled={switching}
            className="flex-1 text-xs px-2 py-1.5 rounded-md border border-amber-300 bg-white text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-50"
          >
            {switching ? "전환 중..." : `${otherRoleLabel}로 전환`}
          </button>
          <button
            onClick={handleExit}
            className="text-xs px-2 py-1.5 rounded-md border border-amber-300 bg-white text-amber-800 hover:bg-amber-100 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
