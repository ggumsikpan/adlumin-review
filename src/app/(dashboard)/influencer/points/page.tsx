"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InfluencerPointsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">포인트</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">보유 포인트</p>
            <p className="text-3xl font-bold">0P</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">총 적립</p>
            <p className="text-3xl font-bold text-green-600">0P</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">총 사용</p>
            <p className="text-3xl font-bold text-red-600">0P</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">포인트 내역</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          포인트 내역이 없습니다. (Phase 4에서 구현 예정)
        </CardContent>
      </Card>
    </div>
  );
}
