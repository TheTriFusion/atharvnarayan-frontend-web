import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Call, WhatsApp, or send a message — Manvinder Singh Enterprises, Chittorgarh.",
};

export default function ContactPage() {
  const { primary, secondary } = SITE.phones;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let’s talk"
        subtitle="Phone, WhatsApp, or email draft — we respond fast for feed orders, dairy routes, and manpower."
      />
      <section className="bg-cream px-4 py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:grid-rows-1 lg:items-start">
          <div className="space-y-6">
            <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold uppercase text-navy">
                {SITE.name}
              </h2>
              <p className="mt-2 text-sm text-navy/80">{SITE.location}</p>
              <p className="mt-1 text-xs text-navy/60">
                GSTIN {SITE.gstin}
              </p>
            </div>
            <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wide text-navy-muted">
                Phone
              </h3>
              <a
                href={`tel:${primary.tel}`}
                className="mt-2 block text-lg font-extrabold text-navy hover:underline"
              >
                {primary.display}
              </a>
              <a
                href={`tel:${secondary.tel}`}
                className="mt-1 block text-lg font-extrabold text-navy hover:underline"
              >
                {secondary.display}
              </a>
            </div>
            <div className="rounded-2xl border border-navy/10 bg-gradient-to-br from-navy to-navy-muted p-6 text-white shadow-md">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gold">
                WhatsApp
              </h3>
              <p className="mt-2 text-sm text-white/85">
                Fastest for rates, routes, and availability.
              </p>
              <a
                href={`https://wa.me/${primary.wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-full bg-gold px-6 py-2.5 text-sm font-extrabold text-navy shadow-lg transition hover:brightness-105"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
