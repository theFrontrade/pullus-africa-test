import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";

import "./globals.css";

const geistSans = Roboto({
  weight: ["400", "700"],
  variable: "--font-geist-sans",
  subsets: ["latin"],
});




export const metadata: Metadata = {
  title: "Pullus Africa Notes - Offline-First Note Taking",
  description: "A Progressive Web App for note-taking that works offline and syncs when online",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Notes PWA",
  },
  formatDetection: {
    telephone: false,
  },
  icons : {
    icon: "/lgoo1.png",
    apple:"/lgoo1.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/lgoo1.png" />
      </head>
      <body
        className={`${geistSans.variable}  bg-[#f5f5f5] antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
