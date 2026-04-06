"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function InfluencerSubmissionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">콘텐츠 제출</h1>
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>선정된 캠페인의 콘텐츠를 여기서 제출할 수 있습니다.</p>
          <p className="text-sm mt-2">Phase 2에서 구현 예정</p>
        </CardContent>
      </Card>
    </div>
  );
}
