"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HomeCta() {
  return (
    <section className="bg-gradient-to-r from-navy via-navy-muted to-navy px-4 py-14 text-white md:py-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <motion.h2
          className="text-2xl font-extrabold uppercase tracking-wide md:text-3xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ready to talk feed, dairy, or logistics?
        </motion.h2>
        <p className="max-w-xl text-sm text-white/85 md:text-base">
          Share your requirement — bulk feed, city milk runs, or manpower — we
          respond on call or WhatsApp.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            className="rounded-full bg-gold px-8 py-3 text-sm font-extrabold uppercase tracking-wide text-navy shadow-lg transition hover:brightness-105"
          >
            Contact us
          </Link>
          <Link
            href="/services"
            className="rounded-full border-2 border-white/40 bg-white/10 px-8 py-3 text-sm font-extrabold uppercase tracking-wide backdrop-blur transition hover:bg-white/20"
          >
            All services
          </Link>
        </div>
      </div>
    </section>
  );
}
