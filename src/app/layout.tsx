import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NFT Sales Alert | Real-Time NFT Market Insights",
  description: "Monitor and analyze the latest NFT sales, volume, and floor prices from the most active collections with instant push notifications.",
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
import { UIProvider } from "@/context/UIContext";
import Navbar from "@/components/Navbar";

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
          <UIProvider>
            <Navbar />
            {children}
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
