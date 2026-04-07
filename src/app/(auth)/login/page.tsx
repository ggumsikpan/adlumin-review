"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const supabase = createClient();

  const handleDemoLogin = async (role: "advertiser" | "influencer") => {
    setDemoLoading(role);
    try {
      const res = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        window.location.href = role === "advertiser" ? "/advertiser" : "/influencer";
        return;
      } else {
        toast.error("샘플 로그인에 실패했습니다.");
      }
    } catch {
      toast.error("샘플 로그인에 실패했습니다.");
    }
    setDemoLoading(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
      setLoading(false);
      return;
    }

    // Fetch profile to determine redirect
    const { data: profile } = await supabase
      .from("review_profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const dest =
      redirect !== "/"
        ? redirect
        : profile?.role === "advertiser"
          ? "/advertiser"
          : profile?.role === "influencer"
            ? "/influencer"
            : profile?.role === "admin"
              ? "/admin"
              : "/";

    router.push(dest);
    router.refresh();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          <Link href="/" className="hover:opacity-80">
            애드루민 리뷰
          </Link>
        </CardTitle>
        <CardDescription>계정에 로그인하세요</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            계정이 없으신가요?{" "}
            <Link href="/register" className="text-primary hover:underline">
              회원가입
            </Link>
          </p>
        </CardFooter>
      </form>

      {/* Demo Mode Section */}
      <div className="px-6 pb-6">
        <div className="relative my-2">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
            또는
          </span>
        </div>
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-3">
          <p className="text-sm font-medium text-amber-800 text-center">
            회원가입 없이 플랫폼을 체험해보세요
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-amber-300 text-amber-800 hover:bg-amber-100"
              disabled={demoLoading !== null}
              onClick={() => handleDemoLogin("advertiser")}
            >
              {demoLoading === "advertiser" ? "접속 중..." : "광고주 체험하기"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-amber-300 text-amber-800 hover:bg-amber-100"
              disabled={demoLoading !== null}
              onClick={() => handleDemoLogin("influencer")}
            >
              {demoLoading === "influencer" ? "접속 중..." : "인플루언서 체험하기"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 bg-muted animate-pulse rounded-lg" />}>
      <LoginForm />
    </Suspense>
  );
}
