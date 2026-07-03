import type { Metadata, Viewport } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "danlimadev",
  description: "Sistema de gerenciamento de freelas",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "danlimadev",
  },
  icons: {
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e1116",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${sora.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
