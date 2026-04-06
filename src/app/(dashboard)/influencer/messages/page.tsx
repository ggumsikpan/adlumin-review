"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function InfluencerMessagesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">메시지</h1>
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>메시지 기능은 Phase 4에서 구현 예정입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
