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
  title: "Waynes — Master Ethical Hacking",
  description:
    "Learn ethical hacking from elite hackers. Web pentesting, bug bounty, AD exploitation, red teaming & more. Real labs, real skills, real careers.",
  keywords: [
    "ethical hacking",
    "pentesting",
    "bug bounty",
    "cybersecurity",
    "OSCP",
    "Kali Linux",
    "Waynes",
  ],
  authors: [{ name: "Waynes" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Waynes — Master Ethical Hacking",
    description:
      "Premium ethical hacking courses taught by elite hackers. Real labs, verifiable certificates, career-changing skills.",
    siteName: "Waynes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Waynes — Master Ethical Hacking",
    description: "Premium ethical hacking courses taught by elite hackers.",
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
