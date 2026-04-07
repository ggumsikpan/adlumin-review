"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Campaign } from "@/lib/types/database";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS,
  CHANNEL_LABELS,
} from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/format";

export default function AdvertiserCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  const fetchCampaigns = async (status?: string) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (status && status !== "all") params.set("status", status);

    const res = await fetch(`/api/campaigns?${params}`);
    const data = await res.json();
    setCampaigns(data.campaigns || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns(tab === "all" ? undefined : tab);
  }, [tab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">캠페인 관리</h1>
        <Button render={<Link href="/advertiser/campaigns/new" />}>
          새 캠페인
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="draft">초안</TabsTrigger>
          <TabsTrigger value="active">모집중</TabsTrigger>
          <TabsTrigger value="in_progress">진행중</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>캠페인이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => {
            const endDate = c.apply_end || c.recruitment_end;
            const startDate = c.apply_start || c.recruitment_start;
            return (
              <Link key={c.id} href={`/advertiser/campaigns/${c.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{c.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {CAMPAIGN_TYPE_LABELS[c.campaign_type] || c.campaign_type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {CHANNEL_LABELS[c.required_channel] || c.required_channel}
                        </Badge>
                        {c.category_name && (
                          <Badge variant="outline" className="text-xs">
                            {c.category_name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        모집 {c.current_applicants}/{c.max_applicants}명 |{" "}
                        {formatDate(startDate)} ~{" "}
                        {formatDate(endDate)}
                      </p>
                    </div>
                    <Badge>{CAMPAIGN_STATUS_LABELS[c.status] || c.status}</Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
