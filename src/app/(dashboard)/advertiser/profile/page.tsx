"use client";

import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_ADVERTISER_PROFILE } from "@/lib/demo-data";

export default function AdvertiserProfilePage() {
  const { profile, isDemo } = useAuth();

  const company = isDemo ? DEMO_ADVERTISER_PROFILE : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">회사 프로필</h1>
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">담당자</span>
            <span>{profile?.display_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">이메일</span>
            <span>{profile?.email}</span>
          </div>
          {company && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">회사명</span>
                <span>{company.company_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">사업자번호</span>
                <span>{company.business_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">대표자</span>
                <span>{company.representative}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">업종</span>
                <span>{company.business_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">주소</span>
                <span className="text-right max-w-[60%]">{company.company_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">전화번호</span>
                <span>{company.company_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">웹사이트</span>
                <span>{company.company_website}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">인증</span>
                <Badge variant={company.verified ? "default" : "secondary"}>
                  {company.verified ? "인증완료" : "미인증"}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {company?.company_description && (
        <Card>
          <CardHeader>
            <CardTitle>회사 소개</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {company.company_description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
