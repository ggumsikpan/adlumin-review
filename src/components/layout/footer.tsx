import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">애드루민 리뷰</h3>
            <p className="text-sm text-muted-foreground">
              광고주와 인플루언서를 연결하는
              <br />
              캠페인 마케팅 플랫폼
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">서비스</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/campaigns" className="hover:text-foreground">
                  캠페인 찾기
                </Link>
              </li>
              <li>
                <Link
                  href="/register/advertiser"
                  className="hover:text-foreground"
                >
                  광고주 등록
                </Link>
              </li>
              <li>
                <Link
                  href="/register/influencer"
                  className="hover:text-foreground"
                >
                  인플루언서 등록
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">고객지원</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/faq" className="hover:text-foreground">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground">
                  서비스 소개
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ADLUMIN &middot; All rights
          reserved. | 플랫폼 제작 &middot; 꿈식판 꿈식맨
        </div>
      </div>
    </footer>
  );
}
