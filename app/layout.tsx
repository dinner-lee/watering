import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "농장 물주기 표",
  description: "사진 한 장으로 물주기 기록을 자동 정리하는 식물 도트 앱",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "물주기" },
};

export const viewport: Viewport = {
  themeColor: "#3e8a37",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
