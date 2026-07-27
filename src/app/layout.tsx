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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://6yardjersey.com'),
  title: {
    default: '6YARD | Buy Football Jerseys Online in India',
    template: '%s | 6YARD',
  },
  description: 'Shop authentic football jerseys online at 6YARD. Explore club jerseys, national team jerseys, football kits, goalkeeper jerseys, retro jerseys and sports accessories. Your premium online football store with complete delivery across India.',
  keywords: ['football jerseys India', 'buy football jersey online', 'club jerseys', 'national team jerseys', 'football kits', 'retro football jerseys', 'sports accessories', 'online football store India', 'football jersey online shopping', '6YARD'],
  openGraph: {
    title: '6YARD | Buy Football Jerseys Online in India',
    description: 'Shop authentic football jerseys online at 6YARD. Explore club jerseys, national team jerseys, football kits, goalkeeper jerseys, retro jerseys and sports accessories.',
    url: 'https://6yardjersey.com',
    siteName: '6YARD',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '6YARD | Buy Football Jerseys Online in India',
    description: 'Shop authentic football jerseys online at 6YARD. Explore club jerseys, national team jerseys, football kits, goalkeeper jerseys, retro jerseys and sports accessories.',
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
    canonical: 'https://6yardjersey.com',
  },
};

import { CartProvider } from "@/context/CartContext";
import { SnackbarProvider } from "@/context/SnackbarContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MetaPixel from "@/components/MetaPixel";

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
                "name": "6YARD",
                "url": "https://6yardjersey.com",
                "logo": "https://6yardjersey.com/logo.png",
                "description": "Premium online football jersey store serving all of India."
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "6YARD",
                "url": "https://6yardjersey.com",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://6yardjersey.com/search?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              }
            ])
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <MetaPixel />
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
