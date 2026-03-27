"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { NAV_LINKS, SITE } from "@/lib/site";

const { primary, secondary } = SITE.phones;

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-skybrand to-skybrand/90 px-4 pb-8 pt-12 text-navy">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3 md:gap-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide">
            {SITE.name}
          </p>
          <p className="mt-2 text-sm font-medium leading-relaxed">
            {SITE.location}
          </p>
          <p className="mt-3 text-xs text-navy/70">
            GSTIN <span className="font-semibold text-navy">{SITE.gstin}</span>
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-navy/80">
            Quick links
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-semibold">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-navy/90 underline-offset-2 hover:text-navy hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <motion.div
          className="flex flex-col items-start gap-2 md:items-end"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-navy/80 md:text-right">
            Call / WhatsApp
          </p>
          <a
            href={`tel:${primary.tel}`}
            className="text-lg font-extrabold text-navy hover:underline"
          >
            {primary.display}
          </a>
          <a
            href={`tel:${secondary.tel}`}
            className="text-lg font-extrabold text-navy hover:underline"
          >
            {secondary.display}
          </a>
          <a
            href={`https://wa.me/${primary.wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-navy-deep"
          >
            WhatsApp
          </a>
        </motion.div>
      </div>

      <p className="mx-auto mt-10 max-w-6xl border-t border-navy/15 pt-6 text-center text-xs text-navy/65">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </p>
    </footer>
  );
}
