import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Dancing_Script, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-love-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Love Strands",
  description: "A Valentine-themed Strands clone.",
};

export const viewport: Viewport = {
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} bg-background text-foreground m-0 font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
