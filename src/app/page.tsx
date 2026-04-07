import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DemoEntryButtons } from "@/components/demo-entry-buttons";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              인플루언서와 브랜드를
              <br />
              <span className="text-primary">연결</span>합니다
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              애드루민 리뷰에서 블로그, 인스타그램, 유튜브, 틱톡 캠페인을
              만나보세요. 광고주는 최적의 인플루언서를, 인플루언서는 나에게 맞는
              캠페인을 찾을 수 있습니다.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button size="lg" render={<Link href="/campaigns" />}>
                캠페인 둘러보기
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/register" />}>
                무료 회원가입
              </Button>
            </div>
            <DemoEntryButtons />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-center mb-12">
              애드루민 리뷰가 특별한 이유
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="text-4xl mb-4">📢</div>
                <h3 className="font-semibold text-lg mb-2">다양한 캠페인</h3>
                <p className="text-sm text-muted-foreground">
                  방문형, 배송형, 기자단까지 다양한 캠페인 유형을 지원합니다.
                  네이버 블로그, 인스타그램, 유튜브, 틱톡 등 모든 채널을
                  커버합니다.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="font-semibold text-lg mb-2">스마트 매칭</h3>
                <p className="text-sm text-muted-foreground">
                  AI 기반 매칭 시스템으로 캠페인에 최적화된 인플루언서를
                  추천합니다. 카테고리, 채널, 팔로워 수 등을 종합 분석합니다.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="font-semibold text-lg mb-2">성과 분석</h3>
                <p className="text-sm text-muted-foreground">
                  캠페인 성과를 실시간으로 추적하고 분석합니다. 조회수, 키워드
                  순위, 참여율 등 상세한 리포트를 제공합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary/5 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">지금 시작하세요</h2>
            <p className="text-muted-foreground mb-8">
              광고주 또는 인플루언서로 무료 가입하고 캠페인을 시작하세요.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button size="lg" render={<Link href="/register/advertiser" />}>
                광고주로 시작
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/register/influencer" />}>
                인플루언서로 시작
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
