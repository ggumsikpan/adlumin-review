"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, profile, loading, signOut, isDemo } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const dashboardPath =
    profile?.role === "advertiser"
      ? "/advertiser"
      : profile?.role === "influencer"
        ? "/influencer"
        : profile?.role === "admin"
          ? "/admin"
          : "/";

  return (
    <>
      {isDemo && (
        <div className="bg-amber-400 text-amber-900 text-center text-sm py-1.5 font-medium">
          샘플 모드 &mdash; 실제 데이터가 아닙니다
        </div>
      )}
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-primary">
              애드루민 리뷰
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/campaigns"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                캠페인
              </Link>
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                소개
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">
                        {profile.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm hidden sm:inline">
                      {profile.display_name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem render={<Link href={dashboardPath} />}>
                    대시보드
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href={`${dashboardPath}/profile`} />}>
                    프로필
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" render={<Link href="/login" />}>
                  로그인
                </Button>
                <Button size="sm" render={<Link href="/register" />}>
                  회원가입
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
