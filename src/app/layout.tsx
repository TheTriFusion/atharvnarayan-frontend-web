import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { SiteShell } from "@/components/SiteShell";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Manvinder Singh Enterprises | Cattle Feed & Dairy Logistics",
    template: "%s | Manvinder Singh Enterprises",
  },
  description:
    "Integrated cattle feed trading, dairy products, and milk logistics across Rajasthan & Maharashtra. Trusted in Chittorgarh & Bhilwara.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className={`${montserrat.className} font-sans`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
