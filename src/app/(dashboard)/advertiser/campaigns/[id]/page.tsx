"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { Campaign, Application } from "@/lib/types/database";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS,
  CHANNEL_LABELS,
  APPLICATION_STATUS_LABELS,
} from "@/lib/utils/constants";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";

export default function AdvertiserCampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/campaigns/${id}`).then((r) => r.json()),
      fetch(`/api/applications?campaign_id=${id}`).then((r) => r.json()),
    ]).then(([campaignData, appData]) => {
      setCampaign(campaignData);
      setApplications(Array.isArray(appData) ? appData : []);
      setLoading(false);
    });
  }, [id]);

  const updateCampaignStatus = async (status: string) => {
    const res = await fetch(`/api/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setCampaign(data);
      toast.success("상태가 변경되었습니다.");
    }
  };

  const updateApplicationStatus = async (
    appId: string,
    status: string
  ) => {
    const res = await fetch(`/api/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: status as Application["status"] } : a))
      );
      toast.success(
        status === "selected" ? "선정되었습니다." : "처리되었습니다."
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
        <div className="h-40 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!campaign) return <p>캠페인을 찾을 수 없습니다.</p>;

  const pendingApps = applications.filter((a) => a.status === "pending");
  const selectedApps = applications.filter((a) => a.status === "selected");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge>{CAMPAIGN_STATUS_LABELS[campaign.status]}</Badge>
            <Badge variant="outline">
              {CAMPAIGN_TYPE_LABELS[campaign.campaign_type]}
            </Badge>
            <Badge variant="secondary">
              {CHANNEL_LABELS[campaign.required_channel]}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold">{campaign.title}</h1>
        </div>
        <div className="flex gap-2">
          {campaign.status === "draft" && (
            <Button onClick={() => updateCampaignStatus("active")}>
              모집 시작
            </Button>
          )}
          {campaign.status === "active" && (
            <Button
              variant="secondary"
              onClick={() => updateCampaignStatus("recruitment_closed")}
            >
              모집 마감
            </Button>
          )}
          {campaign.status === "recruitment_closed" && (
            <Button onClick={() => updateCampaignStatus("in_progress")}>
              진행 시작
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{applications.length}</p>
            <p className="text-xs text-muted-foreground">총 신청</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{pendingApps.length}</p>
            <p className="text-xs text-muted-foreground">대기중</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{selectedApps.length}</p>
            <p className="text-xs text-muted-foreground">선정</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{campaign.view_count}</p>
            <p className="text-xs text-muted-foreground">조회수</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="applicants">
        <TabsList>
          <TabsTrigger value="applicants">
            지원자 ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="info">캠페인 정보</TabsTrigger>
        </TabsList>

        <TabsContent value="applicants" className="space-y-3 mt-4">
          {applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              아직 지원자가 없습니다.
            </div>
          ) : (
            applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {app.influencer?.profile?.display_name || "인플루언서"}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {APPLICATION_STATUS_LABELS[app.status]}
                      </Badge>
                    </div>
                    {app.message && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {app.message}
                      </p>
                    )}
                    {app.influencer?.social_accounts &&
                      app.influencer.social_accounts.length > 0 && (
                        <div className="flex gap-1">
                          {app.influencer.social_accounts.map((sa) => (
                            <Badge
                              key={sa.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {sa.platform} ({sa.follower_count})
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>
                  {app.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          updateApplicationStatus(app.id, "selected")
                        }
                      >
                        선정
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateApplicationStatus(app.id, "rejected")
                        }
                      >
                        미선정
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">모집 기간</span>
                <span>
                  {formatDate(campaign.recruitment_start)} ~{" "}
                  {formatDate(campaign.recruitment_end)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">콘텐츠 마감</span>
                <span>{formatDate(campaign.content_deadline)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">게시 마감</span>
                <span>{formatDate(campaign.publish_deadline)}</span>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground mb-1">설명</p>
                <p className="whitespace-pre-wrap">{campaign.description}</p>
              </div>
              {campaign.guidelines && (
                <div>
                  <p className="text-muted-foreground mb-1">가이드라인</p>
                  <p className="whitespace-pre-wrap">{campaign.guidelines}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
