import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Waynes — Learn Skills That Pay Off",
  description:
    "Premium digital courses on web development, data science, AI/ML, design & marketing. Learn from world-class instructors and earn verifiable certificates.",
  keywords: [
    "online courses",
    "LMS",
    "Waynes",
    "web development",
    "data science",
    "AI",
    "design",
    "certification",
  ],
  authors: [{ name: "Waynes" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Waynes — Learn Skills That Pay Off",
    description:
      "Premium digital courses taught by world-class instructors. Lifetime access, verifiable certificates.",
    siteName: "Waynes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Waynes",
    description: "Premium digital courses taught by world-class instructors.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
