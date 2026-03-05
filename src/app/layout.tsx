import "./globals.css";
import type { Metadata } from "next";
import GNB from "../components/GNB";

export const metadata: Metadata = {
  title: "글로벗 (GloBeot)",
  description: "교환학생 통합 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {/* 1. 전체를 flex 컨테이너로 만들고 최소 높이를 화면 꽉 차게(min-h-screen) 설정 */}
        <div className="flex min-h-screen flex-col bg-background">
          
          {/* 상단 바 */}
          <GNB />

          {/* 2. 본문 영역에 flex-1을 주어 남는 공간을 모두 차지하게 함 (푸터를 아래로 밀어냄) */}
          <main className="flex-1">
            {children}
          </main>

         <footer className="border-t bg-card py-10">
  <div className="container mx-auto max-w-7xl px-4 md:px-6">
    {/* flex-col과 items-center를 사용하여 내부 요소를 수직으로 쌓고 가운데로 모읍니다 */}
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      

      {/* 2. 문제의 그 한 줄 (가운데 정렬) */}
      <div className="text-sm text-muted-foreground">
        <p>© 2026 글로벗. 교환·방문학생을 위한 통합 플랫폼</p>
      </div>

    </div>
  </div>
</footer>

        </div>
      </body>
    </html>
  );
}