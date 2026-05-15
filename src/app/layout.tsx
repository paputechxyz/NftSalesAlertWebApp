import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'NFT Sales Alert - Real-time NFT Market Tracker',
  description: 'Track real-time NFT sales across multiple marketplaces. Get instant alerts, filter by collections, and monitor the NFT market in one place.',
  openGraph: {
    title: "NFT Sales Alert | Real-Time NFT Market Insights",
    description: "Monitor and analyze the latest NFT sales, volume, and floor prices from the most active collections with instant push notifications.",
    url: "https://nft-sales-alert.vercel.app", // Placeholder, will be replaced by actual URL if available
    siteName: "NFT Sales Alert",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NFT Sales Alert Social Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NFT Sales Alert | Real-Time NFT Market Insights",
    description: "Monitor and analyze the latest NFT sales, volume, and floor prices from the most active collections with instant push notifications.",
    images: ["/og-image.jpg"],
    creator: "@nftsalesalert",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { UIProvider } from "@/context/UIContext";
import Navbar from "@/components/Navbar";
import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <NotificationProvider>
            <UIProvider>
              <Suspense fallback={null}>
                <GoogleAnalytics />
              </Suspense>
              <Navbar />
              <div className="flex-grow">
                {children}
              </div>
              <BackToTop />
              <Footer />
            </UIProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
