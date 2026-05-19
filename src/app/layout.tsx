import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  DM_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "DevScope AI — Intelligent Repository Analysis",
    template: "%s | DevScope AI",
  },
  description:
    "Analyze any GitHub repository with AI. Get deep architectural insights, stack detection, quality scores, and actionable recommendations in seconds.",
  keywords: [
    "GitHub analysis",
    "repository insights",
    "code quality",
    "AI code review",
    "architecture analysis",
    "developer tools",
  ],
  authors: [{ name: "DevScope AI" }],
  openGraph: {
    title: "DevScope AI — Intelligent Repository Analysis",
    description:
      "Analyze any GitHub repository with AI. Get deep architectural insights, quality scores, and recommendations in seconds.",
    url: "https://devscope.ai",
    siteName: "DevScope AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevScope AI",
    description: "AI-powered GitHub repository analysis platform.",
    creator: "@devscopeai",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#07070f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="noise bg-bg antialiased">{children}</body>
    </html>
  );
}
