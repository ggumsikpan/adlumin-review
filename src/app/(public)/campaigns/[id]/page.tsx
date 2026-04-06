"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/auth-provider";
import type { Campaign } from "@/lib/types/database";
import {
  CAMPAIGN_TYPE_LABELS,
  CHANNEL_LABELS,
  COMPENSATION_LABELS,
  CAMPAIGN_STATUS_LABELS,
} from "@/lib/utils/constants";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCampaign(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      router.push(`/login?redirect=/campaigns/${id}`);
      return;
    }

    setApplying(true);
    const res = await fetch(`/api/campaigns/${id}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (res.ok) {
      toast.success("신청이 완료되었습니다!");
      setDialogOpen(false);
      // Refresh campaign data
      const updated = await fetch(`/api/campaigns/${id}`).then((r) => r.json());
      setCampaign(updated);
    } else {
      const err = await res.json();
      toast.error(err.error || "신청에 실패했습니다.");
    }
    setApplying(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-64 bg-muted animate-pulse rounded-lg mb-6" />
        <div className="h-8 bg-muted animate-pulse rounded w-2/3 mb-4" />
        <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground">
          캠페인을 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  const isRecruiting = campaign.status === "active";
  const canApply = profile?.role === "influencer" && isRecruiting;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="outline">
            {CAMPAIGN_TYPE_LABELS[campaign.campaign_type]}
          </Badge>
          <Badge variant="secondary">
            {CHANNEL_LABELS[campaign.required_channel]}
          </Badge>
          <Badge
            variant={isRecruiting ? "default" : "secondary"}
          >
            {CAMPAIGN_STATUS_LABELS[campaign.status]}
          </Badge>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          {campaign.title}
        </h1>
        {campaign.advertiser && (
          <p className="text-muted-foreground">
            {campaign.advertiser.company_name}
          </p>
        )}
      </div>

      {/* Thumbnail */}
      {campaign.thumbnail_url && (
        <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-6">
          <img
            src={campaign.thumbnail_url}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">캠페인 소개</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {campaign.description}
              </p>
            </CardContent>
          </Card>

          {campaign.guidelines && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">가이드라인</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {campaign.guidelines}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Content Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">콘텐츠 요구사항</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">필수 이미지 수</span>
                <span>{campaign.required_images_count}장 이상</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">최소 글자 수</span>
                <span>{campaign.min_text_length}자 이상</span>
              </div>
              {campaign.required_keywords &&
                campaign.required_keywords.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">필수 키워드</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {campaign.required_keywords.map((kw) => (
                        <Badge key={kw} variant="outline" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">보상 유형</span>
                <span className="font-medium">
                  {COMPENSATION_LABELS[campaign.compensation_type]}
                </span>
              </div>
              {campaign.cash_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">현금 보상</span>
                  <span className="font-medium text-primary">
                    {formatCurrency(campaign.cash_amount)}
                  </span>
                </div>
              )}
              {campaign.product_name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">제공 제품</span>
                  <span>{campaign.product_name}</span>
                </div>
              )}
              {campaign.store_name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">매장</span>
                  <span>{campaign.store_name}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">모집 인원</span>
                <span>
                  {campaign.current_applicants}/{campaign.max_applicants}명
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">모집 기간</span>
                <span>
                  {formatDate(campaign.recruitment_start)} ~{" "}
                  {formatDate(campaign.recruitment_end)}
                </span>
              </div>
              {campaign.selection_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">선정 발표</span>
                  <span>{formatDate(campaign.selection_date)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">콘텐츠 마감</span>
                <span>{formatDate(campaign.content_deadline)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">게시 마감</span>
                <span>{formatDate(campaign.publish_deadline)}</span>
              </div>
              <Separator />
              {canApply ? (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger>
                    <Button className="w-full" size="lg">
                      신청하기
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>캠페인 신청</DialogTitle>
                      <DialogDescription>
                        광고주에게 전달할 메시지를 작성해주세요 (선택)
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      placeholder="자기소개나 관련 경험을 간단히 작성해주세요..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                    <DialogFooter>
                      <Button
                        onClick={handleApply}
                        disabled={applying}
                        className="w-full"
                      >
                        {applying ? "신청 중..." : "신청 완료"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : !user ? (
                <Button className="w-full" size="lg" render={<a href={`/login?redirect=/campaigns/${campaign.id}`} />}>
                  로그인 후 신청
                </Button>
              ) : !isRecruiting ? (
                <Button className="w-full" size="lg" disabled>
                  모집 마감
                </Button>
              ) : null}
            </CardContent>
          </Card>

          {campaign.store_address && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-1">매장 주소</p>
                <p className="text-sm text-muted-foreground">
                  {campaign.store_address}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
