import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { SplitServices } from "@/components/SplitServices";
import { ProductsSection } from "@/components/ProductsSection";
import { ComplianceStrip } from "@/components/ComplianceStrip";
import { GalleryStrip } from "@/components/GalleryStrip";
import { RegionalBanner } from "@/components/RegionalBanner";
import { HomeCta } from "@/components/HomeCta";

export const metadata: Metadata = {
  description:
    "Manvinder Singh Enterprises — cattle feed trading, dairy logistics, Saras Dairy operations, and Rao Milk tanker transport across Rajasthan & Maharashtra.",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <RegionalBanner />
      <SplitServices />
      <ProductsSection />
      <ComplianceStrip />
      <GalleryStrip />
      <HomeCta />
    </main>
  );
}
