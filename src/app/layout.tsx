import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppLock } from "@/components/app-lock";

// 제목 글꼴은 빌드 때 받지 않고 브라우저가 구글 폰트에서 직접 받는다.
// (빌드 때 받으면 구글 폰트 응답이 이상할 때 배포가 통째로 실패한다)
const SERIF_CSS = "https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600&display=swap";

export const metadata: Metadata = {
  title: "석민과 현지의 살림 기록",
  description: "석민 · 현지 부부 가계부",
  appleWebApp: {
    capable: true,
    title: "살림 기록",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f4f1ea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={SERIF_CSS} />
      </head>
      <body className="min-h-dvh">
        {children}
        <AppLock />
      </body>
    </html>
  );
}
