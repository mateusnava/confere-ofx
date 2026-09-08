import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { GoogleAdsTag } from "@/components/GoogleAdsTag";
import { Header } from "@/components/Header";
import { MixpanelProvider } from "@/components/MixpanelProvider";
import { SiteChrome } from "@/components/SiteChrome";
import { Toaster } from "@/components/Toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-hand",
});

export const metadata: Metadata = {
  title: "Converter PDF em OFX | Confere OFX",
  description:
    "Converta PDF para OFX. Foto do caderno tambem. A gente confere o saldo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#f4fbf9] font-sans">
        <Suspense>
          <SiteChrome>
            <Header />
          </SiteChrome>
        </Suspense>
        {children}
        <Suspense>
          <SiteChrome>
            <Footer />
          </SiteChrome>
        </Suspense>
        <Toaster />
        <MixpanelProvider />
        <GoogleAdsTag />
      </body>
    </html>
  );
}
