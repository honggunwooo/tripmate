import "./globals.css";

export const metadata = {
  title: "TripMate",
  description: "나만의 여행 일정 플래너",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
