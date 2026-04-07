"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import type { Campaign } from "@/lib/types/database";
import { CAMPAIGN_STATUS_LABELS } from "@/lib/utils/constants";
import { DEMO_CAMPAIGNS } from "@/lib/demo-data";
import { toast } from "sonner";

export default function AdvertiserDashboard() {
  const { profile, isDemo } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });

  useEffect(() => {
    if (isDemo) {
      setCampaigns(DEMO_CAMPAIGNS.slice(0, 5));
      const active = DEMO_CAMPAIGNS.filter((c) => c.status === "active").length;
      const completed = DEMO_CAMPAIGNS.filter((c) => c.status === "completed").length;
      setStats({ total: DEMO_CAMPAIGNS.length, active, completed });
      return;
    }

    // Fetch advertiser's campaigns via API
    fetch("/api/campaigns?status=draft&limit=100")
      .then((r) => r.json())
      .then((data) => {
        // We'll load all statuses in a real implementation
      });

    // For now, simple fetch
    Promise.all([
      fetch("/api/campaigns?status=active&limit=5").then((r) => r.json()),
      fetch("/api/campaigns?status=draft&limit=5").then((r) => r.json()),
    ]).then(([active, drafts]) => {
      const all = [...(active.campaigns || []), ...(drafts.campaigns || [])];
      setCampaigns(all.slice(0, 5));
      setStats({
        total: (active.total || 0) + (drafts.total || 0),
        active: active.total || 0,
        completed: 0,
      });
    });
  }, [isDemo]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">
            안녕하세요, {profile?.display_name}님
          </p>
        </div>
        <Button
          render={isDemo ? undefined : <Link href="/advertiser/campaigns/new" />}
          onClick={isDemo ? () => toast.info("샘플 모드에서는 사용할 수 없습니다") : undefined}
        >
          새 캠페인 만들기
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">전체 캠페인</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">진행중</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">완료</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.completed}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">최근 캠페인</CardTitle>
          <Button variant="ghost" size="sm" render={<Link href="/advertiser/campaigns" />}>
            전체 보기
          </Button>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>아직 캠페인이 없습니다.</p>
              <Button
                className="mt-4"
                render={isDemo ? undefined : <Link href="/advertiser/campaigns/new" />}
                onClick={isDemo ? () => toast.info("샘플 모드에서는 사용할 수 없습니다") : undefined}
              >
                첫 캠페인 만들기
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c) => (
                <Link
                  key={c.id}
                  href={`/advertiser/campaigns/${c.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      신청 {c.current_applicants}/{c.max_applicants}명
                    </p>
                  </div>
                  <Badge variant="outline">
                    {CAMPAIGN_STATUS_LABELS[c.status]}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
