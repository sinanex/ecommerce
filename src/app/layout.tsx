import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://kitbayshoes.com'),
  title: {
    default: 'KITBAY | Buy Premium Shoes Online in India',
    template: '%s | KITBAY',
  },
  description: 'Shop premium shoes online at KITBAY. Explore sports shoes, running shoes, sneakers, and casual footwear. Your premium online shoes store with complete delivery across India.',
  keywords: ['shoes India', 'buy shoes online', 'sports shoes', 'sneakers', 'running shoes', 'online shoes store India', 'shoes online shopping', 'KITBAY'],
  openGraph: {
    title: 'KITBAY | Buy Premium Shoes Online in India',
    description: 'Shop premium shoes online at KITBAY. Explore sports shoes, running shoes, sneakers, and casual footwear.',
    url: 'https://kitbayshoes.com',
    siteName: 'KITBAY',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KITBAY | Buy Premium Shoes Online in India',
    description: 'Shop premium shoes online at KITBAY. Explore sports shoes, running shoes, sneakers, and casual footwear.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://kitbayshoes.com',
  },
};

import { CartProvider } from "@/context/CartContext";
import { SnackbarProvider } from "@/context/SnackbarContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "KITBAY",
                "url": "https://kitbayshoes.com",
                "logo": "https://kitbayshoes.com/logo.png",
                "description": "Premium online shoes store serving all of India."
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "KITBAY",
                "url": "https://kitbayshoes.com",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://kitbayshoes.com/search?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              }
            ])
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SnackbarProvider>
          <CartProvider>
            <Navbar />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
            <WhatsAppButton />
          </CartProvider>
        </SnackbarProvider>
      </body>
    </html>
  );
}
