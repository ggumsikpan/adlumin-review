"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampaignCard } from "@/components/campaign/campaign-card";
import type { Campaign } from "@/lib/types/database";
import {
  CAMPAIGN_TYPE_LABELS,
  CHANNEL_LABELS,
} from "@/lib/utils/constants";

export default function InfluencerCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [channel, setChannel] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCampaigns = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "12" });
    if (type !== "all") params.set("type", type);
    if (channel !== "all") params.set("channel", channel);
    if (search) params.set("search", search);

    const res = await fetch(`/api/campaigns?${params}`);
    const data = await res.json();
    setCampaigns(data.campaigns || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, [page, type, channel]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">캠페인 탐색</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            fetchCampaigns();
          }}
          className="flex-1 flex gap-2"
        >
          <Input
            placeholder="캠페인 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="secondary">
            검색
          </Button>
        </form>
        <Select value={type} onValueChange={(v) => { if (v) { setType(v); setPage(1); } }}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 유형</SelectItem>
            {Object.entries(CAMPAIGN_TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={channel} onValueChange={(v) => { if (v) { setChannel(v); setPage(1); } }}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 채널</SelectItem>
            {Object.entries(CHANNEL_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>조건에 맞는 캠페인이 없습니다.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">총 {total}개</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
          {total > 12 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>이전</Button>
              <span className="flex items-center px-3 text-sm">{page} / {Math.ceil(total / 12)}</span>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 12)} onClick={() => setPage(page + 1)}>다음</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
