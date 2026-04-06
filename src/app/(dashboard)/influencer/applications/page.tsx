"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Application } from "@/lib/types/database";
import {
  APPLICATION_STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS,
  CHANNEL_LABELS,
} from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";

export default function InfluencerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((data) => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const cancelApplication = async (id: string) => {
    const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
    if (res.ok) {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: "cancelled" as const } : a
        )
      );
      toast.success("신청이 취소되었습니다.");
    } else {
      toast.error("취소에 실패했습니다.");
    }
  };

  const filtered =
    filter === "all"
      ? applications
      : applications.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">내 신청 목록</h1>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">전체 ({applications.length})</TabsTrigger>
          <TabsTrigger value="pending">
            대기 ({applications.filter((a) => a.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="selected">
            선정 ({applications.filter((a) => a.status === "selected").length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            미선정 (
            {applications.filter((a) => a.status === "rejected").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>신청 내역이 없습니다.</p>
          <Button className="mt-4" render={<Link href="/influencer/campaigns" />}>
            캠페인 찾기
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/campaigns/${app.campaign_id}`}
                      className="font-medium hover:underline"
                    >
                      {app.campaign?.title || "캠페인"}
                    </Link>
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
                  <p className="text-sm text-muted-foreground">
                    {app.campaign?.advertiser?.company_name} |{" "}
                    {app.campaign &&
                      CAMPAIGN_TYPE_LABELS[app.campaign.campaign_type]}{" "}
                    |{" "}
                    {app.campaign &&
                      CHANNEL_LABELS[app.campaign.required_channel]}{" "}
                    | 신청일: {formatDate(app.created_at)}
                  </p>
                </div>
                {app.status === "pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => cancelApplication(app.id)}
                  >
                    취소
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
