"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import type { Application } from "@/lib/types/database";
import {
  APPLICATION_STATUS_LABELS,
  TIER_LABELS,
} from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/format";
import { DEMO_APPLICATIONS } from "@/lib/demo-data";

export default function InfluencerDashboard() {
  const { profile, isDemo } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      setApplications(DEMO_APPLICATIONS);
      setLoading(false);
      return;
    }

    fetch("/api/applications")
      .then((r) => r.json())
      .then((data) => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isDemo]);

  const activeApps = applications.filter(
    (a) => a.status === "pending" || a.status === "selected"
  );
  const completedApps = applications.filter(
    (a) => a.status === "selected"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">
            안녕하세요, {profile?.display_name}님
          </p>
        </div>
        <Button render={<Link href="/influencer/campaigns" />}>
          캠페인 찾기
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">총 신청</p>
            <p className="text-3xl font-bold">{applications.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">진행중</p>
            <p className="text-3xl font-bold text-green-600">
              {activeApps.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">선정됨</p>
            <p className="text-3xl font-bold text-blue-600">
              {completedApps.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">포인트</p>
            <p className="text-3xl font-bold text-yellow-600">0P</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">내 신청 현황</CardTitle>
          <Button variant="ghost" size="sm" render={<Link href="/influencer/applications" />}>
            전체 보기
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-muted animate-pulse rounded"
                />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>아직 신청한 캠페인이 없습니다.</p>
              <Button className="mt-4" render={<Link href="/influencer/campaigns" />}>
                캠페인 둘러보기
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {app.campaign?.title || "캠페인"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {app.campaign?.advertiser?.company_name} |{" "}
                      {formatDate(app.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      app.status === "selected"
                        ? "default"
                        : app.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {APPLICATION_STATUS_LABELS[app.status]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
