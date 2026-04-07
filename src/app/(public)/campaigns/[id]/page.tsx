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
  CAMPAIGN_STATUS_LABELS,
} from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/format";
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
  const applyEnd = campaign.apply_end || campaign.recruitment_end;
  const applyStart = campaign.apply_start || campaign.recruitment_start;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="outline">
            {CAMPAIGN_TYPE_LABELS[campaign.campaign_type] || campaign.campaign_type}
          </Badge>
          <Badge variant="secondary">
            {CHANNEL_LABELS[campaign.required_channel] || campaign.required_channel}
          </Badge>
          <Badge
            variant={isRecruiting ? "default" : "secondary"}
          >
            {CAMPAIGN_STATUS_LABELS[campaign.status] || campaign.status}
          </Badge>
          {campaign.category_name && (
            <Badge variant="outline">{campaign.category_name}</Badge>
          )}
          {campaign.region && (
            <Badge variant="outline">{campaign.region}</Badge>
          )}
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
          {/* 구매처 링크 */}
          {campaign.purchase_link && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">구매처 링크</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={campaign.purchase_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline break-all"
                >
                  {campaign.purchase_link}
                </a>
              </CardContent>
            </Card>
          )}

          {/* 제공내역 */}
          {campaign.provided_items && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">제공내역</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {campaign.provided_items}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 검색키워드 */}
          {campaign.search_keywords_text && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">검색키워드</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {campaign.search_keywords_text}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 체험단 미션 */}
          {campaign.mission && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">체험단 미션</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {campaign.mission}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 필수입력답변 */}
          {campaign.required_qa && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">필수입력답변</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {campaign.required_qa}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 캠페인 소개 (legacy description) */}
          {campaign.description && (
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
          )}

          {/* 상세 이미지 */}
          {campaign.detail_images && campaign.detail_images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">상세 이미지</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaign.detail_images.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`상세 이미지 ${i + 1}`}
                      className="w-full rounded-lg"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">모집 인원</span>
                <span>
                  {campaign.current_applicants}/{campaign.max_applicants}명
                </span>
              </div>
              {campaign.purchase_price != null && campaign.purchase_price > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">구매가격</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("ko-KR").format(campaign.purchase_price)}원
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">모집기간</span>
                <span>
                  {formatDate(applyStart)} ~ {formatDate(applyEnd)}
                </span>
              </div>
              {campaign.announce_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">발표일</span>
                  <span>{formatDate(campaign.announce_date)}</span>
                </div>
              )}
              {(campaign.register_start || campaign.register_end) && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">등록기간</span>
                  <span>
                    {campaign.register_start
                      ? formatDate(campaign.register_start)
                      : ""}{" "}
                    ~{" "}
                    {campaign.register_end
                      ? formatDate(campaign.register_end)
                      : ""}
                  </span>
                </div>
              )}
              {campaign.deadline_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">마감일</span>
                  <span>{formatDate(campaign.deadline_date)}</span>
                </div>
              )}
              {/* Legacy dates fallback */}
              {!campaign.announce_date && campaign.selection_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">선정 발표</span>
                  <span>{formatDate(campaign.selection_date)}</span>
                </div>
              )}
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
