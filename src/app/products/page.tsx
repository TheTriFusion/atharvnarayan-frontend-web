import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ProductsSection } from "@/components/ProductsSection";

export const metadata: Metadata = {
  title: "Dairy Products",
  description:
    "Milk, ghee, dahi, chaach, paneer — selling and transporting dairy products across our network.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Dairy range"
        subtitle="We trade and move everyday dairy essentials — aligned with your distribution and logistics routes."
      />
      <ProductsSection showPageLink={false} variant="light" />
      <section className="border-t border-navy/10 bg-white px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm leading-relaxed text-navy/80">
            Product mix and availability vary by season and route. For bulk or
            regular supply, share your lane and volume — we&apos;ll align with
            what moves best on our tankers and city supply.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-full bg-navy px-8 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-md transition hover:bg-navy-deep"
          >
            Enquire now
          </Link>
        </div>
      </section>
    </>
  );
}
