"use client";

import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIER_LABELS } from "@/lib/utils/constants";

export default function InfluencerProfilePage() {
  const { profile, isDemo } = useAuth();

  // Demo-specific enriched data
  const demoExtra = isDemo
    ? {
        tier: "silver" as const,
        bio: "라이프스타일 & 뷰티 전문 블로거. 네이버 블로그 일평균 방문자 2,800명. 카페/맛집/스킨케어 리뷰를 주로 합니다.",
        region: "서울",
        totalCompleted: 7,
        averageRating: 4.6,
        accounts: [
          { platform: "네이버 블로그", name: "라이프로그서영", followers: 8400 },
          { platform: "인스타그램", name: "@lifelog_sy", followers: 15200 },
        ],
      }
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">프로필</h1>
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">이름</span>
            <span>{profile?.display_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">이메일</span>
            <span>{profile?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">등급</span>
            <Badge variant="outline">
              {demoExtra
                ? TIER_LABELS[demoExtra.tier] || demoExtra.tier
                : "스탠다드"}
            </Badge>
          </div>
          {demoExtra && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">지역</span>
                <span>{demoExtra.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">완료 캠페인</span>
                <span>{demoExtra.totalCompleted}건</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">평균 평점</span>
                <span>{demoExtra.averageRating}점</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {demoExtra?.bio && (
        <Card>
          <CardHeader>
            <CardTitle>자기소개</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {demoExtra.bio}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>연결된 SNS 계정</CardTitle>
        </CardHeader>
        <CardContent>
          {demoExtra ? (
            <div className="space-y-3">
              {demoExtra.accounts.map((acc) => (
                <div
                  key={acc.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium">{acc.platform}</p>
                    <p className="text-xs text-muted-foreground">{acc.name}</p>
                  </div>
                  <span className="text-sm font-medium">
                    {new Intl.NumberFormat("ko-KR").format(acc.followers)}명
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-6">
              <p>SNS 계정 연결 기능은 Phase 2에서 구현 예정입니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
