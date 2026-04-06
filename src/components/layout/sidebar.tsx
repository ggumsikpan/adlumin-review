"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
}

const influencerItems: SidebarItem[] = [
  { label: "대시보드", href: "/influencer", icon: "📊" },
  { label: "캠페인 탐색", href: "/influencer/campaigns", icon: "��" },
  { label: "내 신청", href: "/influencer/applications", icon: "📋" },
  { label: "콘텐츠 제출", href: "/influencer/submissions", icon: "📝" },
  { label: "포인트", href: "/influencer/points", icon: "💰" },
  { label: "메시지", href: "/influencer/messages", icon: "💬" },
  { label: "프로필", href: "/influencer/profile", icon: "👤" },
];

const advertiserItems: SidebarItem[] = [
  { label: "대시보드", href: "/advertiser", icon: "📊" },
  { label: "캠페인 관리", href: "/advertiser/campaigns", icon: "📢" },
  { label: "성과 리포트", href: "/advertiser/reports", icon: "📈" },
  { label: "메시지", href: "/advertiser/messages", icon: "💬" },
  { label: "프로필", href: "/advertiser/profile", icon: "🏢" },
];

const adminItems: SidebarItem[] = [
  { label: "대시보드", href: "/admin", icon: "📊" },
  { label: "사용자 관리", href: "/admin/users", icon: "👥" },
  { label: "캠페인 관리", href: "/admin/campaigns", icon: "📢" },
  { label: "콘텐츠 검토", href: "/admin/submissions", icon: "📝" },
  { label: "경고 관리", href: "/admin/warnings", icon: "⚠️" },
  { label: "카테고리", href: "/admin/categories", icon: "📂" },
  { label: "분석", href: "/admin/analytics", icon: "📈" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const items =
    profile?.role === "influencer"
      ? influencerItems
      : profile?.role === "advertiser"
        ? advertiserItems
        : adminItems;

  return (
    <aside className="w-60 border-r bg-white min-h-[calc(100vh-4rem)] hidden lg:block">
      <nav className="p-4 space-y-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${profile?.role}` &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
