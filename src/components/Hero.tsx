"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { motion } from "framer-motion";
import { LogoMark } from "./LogoMark";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-arc-stroke", {
        strokeDasharray: 400,
        strokeDashoffset: 400,
        duration: 1.1,
      })
        .from(
          ".hero-logo-wrap",
          { scale: 0.6, opacity: 0, duration: 0.5 },
          "-=0.4",
        )
        .from(".hero-company", { y: 28, opacity: 0, duration: 0.65 }, "-=0.35")
        .from(".hero-pill", { scale: 0.92, opacity: 0, duration: 0.45 }, "-=0.4")
        .from(".hero-headline", { y: 22, opacity: 0, duration: 0.55 }, "-=0.25");
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={root}
      className="relative overflow-hidden bg-gradient-to-b from-white to-cream px-4 pb-16 pt-10 md:pb-24 md:pt-14"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-skybrand/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-gold/15 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="hero-logo-wrap mb-6 flex items-center gap-4">
          <LogoMark className="h-16 w-16 shrink-0 md:h-20 md:w-20" />
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-skybrand md:text-sm">
              Manvinder Singh
            </p>
            <p className="text-2xl font-extrabold uppercase tracking-tight text-navy md:text-3xl">
              Enterprises
            </p>
          </div>
        </div>

        <motion.p
          className="hero-pill mb-6 inline-flex rounded-full border border-skybrand/30 bg-skybrand/10 px-4 py-1.5 text-sm font-medium text-navy-muted"
        >
          Trust of Chittorgarh &amp; Bhilwara — 8+ years
        </motion.p>

        <h1 className="hero-company mb-4 text-3xl font-extrabold uppercase leading-tight tracking-tight text-navy md:text-5xl">
          Integrated Cattle Feed &amp; Dairy Logistics
        </h1>

        <p className="hero-headline max-w-2xl text-lg font-semibold text-navy-muted md:text-xl">
          Premium feed brands, city-wide dairy supply, and dependable tanker
          logistics — your strategic partner across Rajasthan and beyond.
        </p>

        <motion.div
          className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-center text-xs font-bold uppercase text-navy md:text-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          <span className="rounded-lg bg-white/80 px-2 py-3 shadow-sm ring-1 ring-navy/10">
            Quality Feed
          </span>
          <span className="rounded-lg bg-white/80 px-2 py-3 shadow-sm ring-1 ring-navy/10">
            Better Yield
          </span>
          <span className="rounded-lg bg-white/80 px-2 py-3 shadow-sm ring-1 ring-navy/10">
            Reliable Service
          </span>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.45 }}
        >
          <Link
            href="/services"
            className="rounded-full bg-navy px-7 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg ring-2 ring-navy/20 transition hover:bg-navy-deep"
          >
            Explore services
          </Link>
          <Link
            href="/contact"
            className="rounded-full border-2 border-skybrand bg-white px-7 py-3 text-sm font-extrabold uppercase tracking-wide text-navy shadow-md transition hover:bg-cream"
          >
            Get in touch
          </Link>
          <Link
            href="/#services"
            className="text-sm font-bold text-skybrand underline-offset-4 hover:underline"
          >
            Quick scroll ↓
          </Link>
        </motion.div>
      </div>
    </header>
  );
}
