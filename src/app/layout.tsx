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
        <div className="flex min-h-screen flex-col bg-background">
          <GNB />
          <main className="flex-1">{children}</main>

          <footer className="border-t bg-card py-10">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
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
