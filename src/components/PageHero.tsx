"use client";

import { motion } from "framer-motion";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-muted to-navy-deep px-4 py-14 text-white md:py-20">
      <div
        className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-skybrand/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl text-center">
        {eyebrow ? (
          <motion.p
            className="text-xs font-bold uppercase tracking-[0.35em] text-skybrand"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {eyebrow}
          </motion.p>
        ) : null}
        <motion.h1
          className="mt-3 text-3xl font-extrabold uppercase leading-tight tracking-tight md:text-5xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          {title}
        </motion.h1>
        {subtitle ? (
          <motion.p
            className="mx-auto mt-5 max-w-2xl text-base font-medium text-white/85 md:text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
          >
            {subtitle}
          </motion.p>
        ) : null}
      </div>
    </header>
  );
}
