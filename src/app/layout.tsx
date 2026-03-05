// src/app/layout.tsx
import "./globals.css"; // 이 줄이 반드시 있어야 합니다!
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
      <body><GNB /><main>{children}</main></body>
    </html>
  );
}
