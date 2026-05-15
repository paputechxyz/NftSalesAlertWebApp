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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://app.nftsalesalert.com'),
  title: {
    default: 'NFT Sales Alert - Free Real-Time OpenSea Notifications',
    template: '%s | NFT Sales Alert'
  },
  description: 'Get instant NFT sales alerts and notifications from OpenSea. Track sales activity and NFT collections in real-time with no wallet connection required.',
  keywords: ['NFT sales alert', 'OpenSea notifications', 'NFT floor price tracker', 'Real-time NFT alerts', 'NFT price alerts', 'OpenSea sales bot', 'NFT watchlist'],
  authors: [{ name: 'NFT Sales Alert' }],
  creator: 'NFT Sales Alert',
  publisher: 'NFT Sales Alert',
  openGraph: {
    title: "NFT Sales Alert - Real-Time OpenSea Notifications",
    description: "Never miss a flip. Get instant push notifications for NFT sales on OpenSea.",
    url: "https://app.nftsalesalert.com",
    siteName: "NFT Sales Alert",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NFT Sales Alert - Real-Time NFT Notifications",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NFT Sales Alert - Real-Time OpenSea Notifications",
    description: "Never miss a flip. Get instant push notifications for NFT sales on OpenSea.",
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
