import type { Metadata } from "next";
import { Gamja_Flower } from "next/font/google";
import "./globals.css";

const gamjaFlower = Gamja_Flower({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-handwriting",
});

export const metadata: Metadata = {
  title: "Diet Daily - 체중 관리 앱",
  description: "다이어트 중인 사용자를 위한 체중 관리 웹 애플리케이션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${gamjaFlower.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-handwriting">
        {children}
      </body>
    </html>
  );
}
