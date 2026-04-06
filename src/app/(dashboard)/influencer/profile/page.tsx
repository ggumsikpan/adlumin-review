"use client";

import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function InfluencerProfilePage() {
  const { profile } = useAuth();

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
            <Badge variant="outline">스탠다드</Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>연결된 SNS 계정</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-6">
          <p>SNS 계정 연결 기능은 Phase 2에서 구현 예정입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
