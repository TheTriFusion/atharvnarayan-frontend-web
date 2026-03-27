"use client";

import { motion } from "framer-motion";

export function RegionalBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-navy-deep via-navy to-navy-muted px-4 py-12 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(74,144,226,0.35), transparent 50%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <motion.p
          className="text-sm font-semibold uppercase tracking-[0.2em] text-skybrand"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Operating across Rajasthan
        </motion.p>
        <motion.h2
          className="mt-3 text-2xl font-extrabold md:text-4xl"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
        >
          Chittorgarh · Bhilwara · Jaipur corridor
        </motion.h2>
        <motion.p
          className="mt-4 text-sm text-white/80 md:text-base"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Recognized service provider and trader — city supply, inter-state
          tanker runs, and dependable manpower for dairies.
        </motion.p>
      </div>
    </section>
  );
}
