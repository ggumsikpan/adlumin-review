"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleDemoMode } from "@/lib/demo-data";

export function DemoEntryButtons() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleDemo = async (role: "advertiser" | "influencer") => {
    setLoading(role);
    const ok = await toggleDemoMode(role);
    if (ok) {
      router.push(role === "advertiser" ? "/advertiser" : "/influencer");
      router.refresh();
    }
    setLoading(null);
  };

  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <p className="text-sm text-muted-foreground">
        회원가입 없이 체험해보세요
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => handleDemo("advertiser")}
          disabled={loading !== null}
          className="text-sm px-4 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-50"
        >
          {loading === "advertiser" ? "접속 중..." : "광고주로 체험하기"}
        </button>
        <button
          onClick={() => handleDemo("influencer")}
          disabled={loading !== null}
          className="text-sm px-4 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-50"
        >
          {loading === "influencer" ? "접속 중..." : "인플루언서로 체험하기"}
        </button>
      </div>
    </div>
  );
}
