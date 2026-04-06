"use client";

import { useState, useEffect } from "react";
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
  CHANNEL_LABELS,
  COMPENSATION_LABELS,
} from "@/lib/utils/constants";
import type { Category } from "@/lib/types/database";
import { toast } from "sonner";

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Fetch categories
    fetch("/api/campaigns?limit=0")
      .then(() => {
        // Categories could be fetched separately; for now hardcode
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const body = {
      title: form.get("title"),
      description: form.get("description"),
      campaign_type: form.get("campaign_type"),
      required_channel: form.get("required_channel"),
      compensation_type: form.get("compensation_type"),
      compensation_value: form.get("compensation_value") || null,
      cash_amount: parseInt((form.get("cash_amount") as string) || "0"),
      product_name: form.get("product_name") || null,
      product_value: parseInt((form.get("product_value") as string) || "0") || null,
      store_name: form.get("store_name") || null,
      store_address: form.get("store_address") || null,
      max_applicants: parseInt((form.get("max_applicants") as string) || "10"),
      recruitment_start: form.get("recruitment_start"),
      recruitment_end: form.get("recruitment_end"),
      selection_date: form.get("selection_date") || null,
      content_deadline: form.get("content_deadline"),
      publish_deadline: form.get("publish_deadline"),
      guidelines: form.get("guidelines") || null,
      required_keywords: (form.get("required_keywords") as string)
        ?.split(",")
        .map((k) => k.trim())
        .filter(Boolean) || [],
      required_images_count: parseInt(
        (form.get("required_images_count") as string) || "1"
      ),
      min_text_length: parseInt(
        (form.get("min_text_length") as string) || "500"
      ),
      status: "draft",
    };

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
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">새 캠페인 만들기</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">기본 정보</CardTitle>
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
            <div className="space-y-2">
              <Label htmlFor="description">캠페인 설명 *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="캠페인에 대해 자세히 설명해주세요"
                rows={5}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>캠페인 유형 *</Label>
                <Select name="campaign_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CAMPAIGN_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>필수 채널 *</Label>
                <Select name="required_channel" required>
                  <SelectTrigger>
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CHANNEL_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>모집 인원 *</Label>
                <Input
                  name="max_applicants"
                  type="number"
                  min="1"
                  defaultValue="10"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compensation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">보상 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>보상 유형 *</Label>
                <Select name="compensation_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COMPENSATION_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cash_amount">현금 보상 (원)</Label>
                <Input
                  id="cash_amount"
                  name="cash_amount"
                  type="number"
                  min="0"
                  defaultValue="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="product_name">제공 제품명</Label>
                <Input
                  id="product_name"
                  name="product_name"
                  placeholder="제품/서비스명"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_value">제품 가치 (원)</Label>
                <Input
                  id="product_value"
                  name="product_value"
                  type="number"
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="compensation_value">보상 상세 설명</Label>
              <Input
                id="compensation_value"
                name="compensation_value"
                placeholder="예: 5만원 상당 화장품 세트 + 현금 2만원"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location (for visit type) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              매장 정보 (방문형 캠페인)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="store_name">매장명</Label>
                <Input
                  id="store_name"
                  name="store_name"
                  placeholder="매장 이름"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_address">매장 주소</Label>
                <Input
                  id="store_address"
                  name="store_address"
                  placeholder="서울시 강남구..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">일정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>모집 시작일 *</Label>
                <Input
                  name="recruitment_start"
                  type="datetime-local"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>모집 마감일 *</Label>
                <Input
                  name="recruitment_end"
                  type="datetime-local"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>선정 발표일</Label>
                <Input name="selection_date" type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label>콘텐츠 마감일 *</Label>
                <Input
                  name="content_deadline"
                  type="datetime-local"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>게시 마감일 *</Label>
                <Input
                  name="publish_deadline"
                  type="datetime-local"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">콘텐츠 요구사항</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guidelines">상세 가이드라인</Label>
              <Textarea
                id="guidelines"
                name="guidelines"
                placeholder="인플루언서에게 전달할 콘텐츠 가이드라인을 작성해주세요"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="required_keywords">필수 키워드</Label>
                <Input
                  id="required_keywords"
                  name="required_keywords"
                  placeholder="쉼표로 구분"
                />
              </div>
              <div className="space-y-2">
                <Label>필수 이미지 수</Label>
                <Input
                  name="required_images_count"
                  type="number"
                  min="0"
                  defaultValue="1"
                />
              </div>
              <div className="space-y-2">
                <Label>최소 글자수</Label>
                <Input
                  name="min_text_length"
                  type="number"
                  min="0"
                  defaultValue="500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

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
