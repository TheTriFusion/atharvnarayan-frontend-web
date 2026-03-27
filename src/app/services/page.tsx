import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Cattle feed trading, milk transport, dairy manpower, Rao Milk tankers, and Saras Dairy operations.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Feed, dairy & logistics"
        subtitle="End-to-end support for nutrition, movement, and people — tuned for Rajasthan’s dairy ecosystem."
      />
      <section className="bg-cream px-4 py-14 md:py-20">
        <div className="mx-auto max-w-4xl space-y-12">
          <article className="rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-extrabold uppercase tracking-wide text-navy">
              Cattle feed &amp; pellets
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-navy/80">
              Premium balanced feed for herd health and higher milk yield. We
              supply trusted brands in pellet and mash forms, with bulk and
              retail options.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm font-medium text-navy/90">
              <li>Saras Gold — pellets (e.g. 50&nbsp;kg bags); ask for live rate</li>
              <li>Pachranga &amp; Sara cattle feed</li>
              <li>Makhan Mishri — maize &amp; cottonseed-based mixes</li>
              <li>Bulk supply &amp; on-time delivery</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-extrabold uppercase tracking-wide text-navy">
              Milk &amp; dairy logistics
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-navy/80">
              Safe, hygienic movement of milk and dairy products — from plant to
              booth and distribution points in city supply networks. We
              currently work with Saras Dairy, Rajasthan.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm font-medium text-navy/90">
              <li>Equipped tankers &amp; strict quality focus</li>
              <li>Timely delivery across Bhilwara &amp; Jaipur region</li>
              <li>Inter-state routes via Rao Milk tankers (Rajasthan &amp; Maharashtra)</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-extrabold uppercase tracking-wide text-navy">
              Manpower &amp; operations
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-navy/80">
              Trained staff for dairies — milk processing, testing, collection,
              and day-to-day support.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm font-medium text-navy/90">
              <li>Tanker operators &amp; drivers</li>
              <li>Processing &amp; lab testing support</li>
              <li>Production &amp; operations assistance</li>
            </ul>
          </article>
        </div>
      </section>
    </>
  );
}
