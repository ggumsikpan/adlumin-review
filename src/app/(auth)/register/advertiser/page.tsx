"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function AdvertiserRegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const displayName = formData.get("displayName") as string;
    const companyName = formData.get("companyName") as string;
    const businessNumber = formData.get("businessNumber") as string;
    const representative = formData.get("representative") as string;
    const companyPhone = formData.get("companyPhone") as string;
    const companyDescription = formData.get("companyDescription") as string;

    if (password !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("비밀번호는 6자 이상이어야 합니다.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        role: "advertiser",
        displayName,
        companyName,
        businessNumber,
        representative,
        companyPhone,
        companyDescription,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "회원가입에 실패했습니다.");
      setLoading(false);
      return;
    }

    // Sign in after registration
    await supabase.auth.signInWithPassword({ email, password });

    toast.success("회원가입이 완료되었습니다!");
    router.push("/advertiser");
    router.refresh();
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle>
          <Link href="/" className="hover:opacity-80">
            광고주 회원가입
          </Link>
        </CardTitle>
        <CardDescription>
          캠페인을 등록하고 인플루언서를 모집하세요
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일 *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@company.com"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호 *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="6자 이상"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="비밀번호 재입력"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">담당자명 *</Label>
            <Input
              id="displayName"
              name="displayName"
              placeholder="홍길동"
              required
            />
          </div>
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-3">회사 정보</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">회사명 *</Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="(주)회사명"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="businessNumber">사업자등록번호</Label>
              <Input
                id="businessNumber"
                name="businessNumber"
                placeholder="000-00-00000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="representative">대표자명</Label>
              <Input
                id="representative"
                name="representative"
                placeholder="대표자명"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyPhone">회사 연락처</Label>
            <Input
              id="companyPhone"
              name="companyPhone"
              placeholder="02-0000-0000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyDescription">회사 소개</Label>
            <Textarea
              id="companyDescription"
              name="companyDescription"
              placeholder="회사에 대해 간단히 소개해주세요"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "가입 중..." : "광고주로 가입하기"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-primary hover:underline">
              로그인
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
