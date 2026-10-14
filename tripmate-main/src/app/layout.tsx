import "./globals.css";

export const metadata = {
  title: "TripMate | 나만의 여행 플래너",
  description: "AI가 취향에 맞는 여행 일정을 추천해 드려요.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
