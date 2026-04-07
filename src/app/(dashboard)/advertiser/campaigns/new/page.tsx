"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CAMPAIGN_TYPE_LABELS,
  SELLER_CHANNEL_OPTIONS,
  PLACE_CHANNEL_OPTIONS,
  SELLER_CATEGORIES,
  PLACE_CATEGORIES,
  REGIONS,
} from "@/lib/utils/constants";
import { toast } from "sonner";

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [campaignType, setCampaignType] = useState<"seller" | "place" | "">("");
  const [channel, setChannel] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [region, setRegion] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [detailPreviews, setDetailPreviews] = useState<string[]>([]);

  // Date state for weekday validation
  const [announceDate, setAnnounceDate] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");

  const channelOptions =
    campaignType === "seller"
      ? SELLER_CHANNEL_OPTIONS
      : campaignType === "place"
        ? PLACE_CHANNEL_OPTIONS
        : [];

  const categoryOptions =
    campaignType === "seller"
      ? SELLER_CATEGORIES
      : campaignType === "place"
        ? PLACE_CATEGORIES
        : [];

  const handleTypeSelect = (type: "seller" | "place") => {
    setCampaignType(type);
    setChannel("");
    setCategoryName("");
    setRegion("");
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleDetailImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls = Array.from(files).map((f) => URL.createObjectURL(f));
      setDetailPreviews(urls);
    } else {
      setDetailPreviews([]);
    }
  };

  const handleWeekdayDate = (
    value: string,
    setter: (v: string) => void
  ) => {
    if (!value) {
      setter("");
      return;
    }
    const date = new Date(value);
    const day = date.getDay();
    if (day === 0 || day === 6) {
      alert("토요일/일요일은 선택할 수 없습니다. 평일을 선택해주세요.");
      setter("");
      return;
    }
    setter(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!campaignType) {
      toast.error("캠페인 유형을 선택해주세요.");
      return;
    }
    if (!channel) {
      toast.error("광고 채널을 선택해주세요.");
      return;
    }
    if (!categoryName) {
      toast.error("카테고리를 선택해주세요.");
      return;
    }

    setLoading(true);

    const form = new FormData(e.currentTarget);

    const body = {
      title: form.get("title"),
      description: "",
      campaign_type: campaignType,
      required_channel: channel,
      category_name: categoryName,
      region: campaignType === "place" ? region || null : null,
      purchase_link: form.get("purchase_link") || null,
      purchase_price:
        parseInt((form.get("purchase_price") as string) || "0") || null,
      max_applicants: parseInt(
        (form.get("max_applicants") as string) || "10"
      ),
      provided_items: form.get("provided_items") || null,
      search_keywords_text: form.get("search_keywords_text") || null,
      mission: form.get("mission") || null,
      required_qa: form.get("required_qa") || null,
      // Dates
      apply_start: form.get("apply_start"),
      apply_end: form.get("apply_end"),
      announce_date: announceDate || null,
      register_start: form.get("register_start") || null,
      register_end: form.get("register_end") || null,
      deadline_date: deadlineDate || null,
      // Legacy compatibility
      recruitment_start: form.get("apply_start"),
      recruitment_end: form.get("apply_end"),
      selection_date: announceDate || null,
      content_deadline:
        form.get("register_end") || form.get("apply_end"),
      publish_deadline: deadlineDate || form.get("apply_end"),
      compensation_type: "product",
      cash_amount: 0,
      status: "draft",
    };

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("캠페인이 생성되었습니다!");
        router.push(`/advertiser/campaigns/${data.id}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "캠페인 생성에 실패했습니다.");
      }
    } catch {
      toast.error("캠페인 생성에 실패했습니다.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">새 캠페인 만들기</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 캠페인 제목 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">캠페인 제목</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">캠페인 제목 *</Label>
              <Input
                id="title"
                name="title"
                placeholder="캠페인 제목을 입력하세요"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* 썸네일 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">썸네일 이미지</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="thumbnail">썸네일 업로드</Label>
              <Input
                id="thumbnail"
                name="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              {thumbnailPreview && (
                <div className="mt-2">
                  <img
                    src={thumbnailPreview}
                    alt="썸네일 미리보기"
                    className="w-48 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 구매처 링크 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">구매처 링크</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_link">구매처 링크 (URL)</Label>
              <Input
                id="purchase_link"
                name="purchase_link"
                type="url"
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* 캠페인 유형 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">캠페인 유형 *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleTypeSelect("seller")}
                className={`p-6 rounded-xl border-2 text-center transition-all ${
                  campaignType === "seller"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-muted hover:border-primary/40"
                }`}
              >
                <div className="text-4xl mb-2">📦</div>
                <div className="font-semibold text-lg">제품형(셀러)</div>
                <p className="text-sm text-muted-foreground mt-1">
                  제품을 배송받아 리뷰
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleTypeSelect("place")}
                className={`p-6 rounded-xl border-2 text-center transition-all ${
                  campaignType === "place"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-muted hover:border-primary/40"
                }`}
              >
                <div className="text-4xl mb-2">📍</div>
                <div className="font-semibold text-lg">방문형(플레이스)</div>
                <p className="text-sm text-muted-foreground mt-1">
                  매장을 방문하여 리뷰
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 광고채널 */}
        {campaignType && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">광고 채널 *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {channelOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setChannel(opt.value)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      channel === opt.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 카테고리 */}
        {campaignType && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">카테고리 *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryName(cat)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      categoryName === cat
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted hover:border-primary/40"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 지역 (방문형만) */}
        {campaignType === "place" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">지역</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={region} onValueChange={(v) => { if (v) setRegion(v); }}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="지역을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* 일정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">일정 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 모집기간 */}
            <div className="space-y-2">
              <Label className="font-semibold">모집기간 *</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">시작일</Label>
                  <Input name="apply_start" type="date" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">마감일</Label>
                  <Input name="apply_end" type="date" required />
                </div>
              </div>
            </div>

            {/* 발표일 */}
            <div className="space-y-2">
              <Label className="font-semibold">발표일 (평일만 선택 가능)</Label>
              <Input
                type="date"
                value={announceDate}
                onChange={(e) =>
                  handleWeekdayDate(e.target.value, setAnnounceDate)
                }
              />
            </div>

            {/* 등록기간 */}
            <div className="space-y-2">
              <Label className="font-semibold">등록기간</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">시작일</Label>
                  <Input name="register_start" type="date" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">마감일</Label>
                  <Input name="register_end" type="date" />
                </div>
              </div>
            </div>

            {/* 마감일 */}
            <div className="space-y-2">
              <Label className="font-semibold">마감일 (평일만 선택 가능)</Label>
              <Input
                type="date"
                value={deadlineDate}
                onChange={(e) =>
                  handleWeekdayDate(e.target.value, setDeadlineDate)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* 상세 페이지 이미지 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">상세 페이지 이미지</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="detail_images">이미지 업로드 (여러 장 가능)</Label>
              <Input
                id="detail_images"
                name="detail_images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleDetailImagesChange}
              />
              {detailPreviews.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {detailPreviews.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`상세 이미지 ${i + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 제공내역, 모집인원, 구매가격 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">캠페인 상세</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provided_items">제공내역</Label>
              <Textarea
                id="provided_items"
                name="provided_items"
                placeholder="리뷰어에게 제공되는 내역을 입력하세요"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_applicants">모집인원 *</Label>
                <Input
                  id="max_applicants"
                  name="max_applicants"
                  type="number"
                  min="1"
                  defaultValue="10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_price">구매가격 (원, 선택)</Label>
                <Input
                  id="purchase_price"
                  name="purchase_price"
                  type="number"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 검색키워드, 미션, 필수입력답변 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">미션 및 키워드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search_keywords_text">검색키워드</Label>
              <Textarea
                id="search_keywords_text"
                name="search_keywords_text"
                placeholder="검색 키워드를 입력하세요 (줄바꿈 또는 쉼표로 구분)"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mission">체험단 미션</Label>
              <Textarea
                id="mission"
                name="mission"
                placeholder="체험단 미션을 입력하세요"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="required_qa">필수입력답변</Label>
              <Textarea
                id="required_qa"
                name="required_qa"
                placeholder="리뷰어에게 요청할 필수 질문/답변 항목을 입력하세요"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "생성 중..." : "캠페인 생성 (초안)"}
          </Button>
        </div>
      </form>
    </div>
  );
}
