import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CyberSentinel AI — Explainable Network Intrusion Detection",
  description:
    "CyberSentinel AI analyzes network traffic features, predicts traffic category with a Random Forest classifier, and explains each prediction in plain language with safe investigation guidance.",
  keywords: [
    "CyberSentinel AI",
    "Network Intrusion Detection",
    "NIDS",
    "Explainable AI",
    "CIC-IDS2017",
    "Random Forest",
    "cybersecurity",
  ],
  authors: [{ name: "CyberSentinel AI" }],
  openGraph: {
    title: "CyberSentinel AI",
    description:
      "Explainable Network Intrusion Detection — ML detection + generative-AI explanation.",
    siteName: "CyberSentinel AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
        <SonnerToaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}
