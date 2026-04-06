import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold hover:opacity-80">
          애드루민 리뷰
        </Link>
        <p className="text-muted-foreground mt-2">가입 유형을 선택해주세요</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="text-5xl mb-2">🏢</div>
            <CardTitle>광고주</CardTitle>
            <CardDescription>
              캠페인을 등록하고 인플루언서를 모집하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="text-sm text-muted-foreground space-y-1 mb-6 text-left">
              <li>- 캠페인 생성 및 관리</li>
              <li>- 인플루언서 선정</li>
              <li>- 콘텐츠 검토 및 승인</li>
              <li>- 성과 분석 리포트</li>
            </ul>
            <Button className="w-full" render={<Link href="/register/advertiser" />}>
              광고주로 가입
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="text-5xl mb-2">✨</div>
            <CardTitle>인플루언서</CardTitle>
            <CardDescription>
              다양한 캠페인에 참여하고 수익을 올리세요
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="text-sm text-muted-foreground space-y-1 mb-6 text-left">
              <li>- 맞춤 캠페인 추천</li>
              <li>- 포인트 적립 및 현금 보상</li>
              <li>- 등급 시스템 (프리미어)</li>
              <li>- 성과 대시보드</li>
            </ul>
            <Button className="w-full" variant="outline" render={<Link href="/register/influencer" />}>
              인플루언서로 가입
            </Button>
          </CardContent>
        </Card>
      </div>
      <p className="text-sm text-muted-foreground text-center mt-6">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-primary hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
