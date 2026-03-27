"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const item = {
  hidden: { opacity: 0, x: -20 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.08, duration: 0.45 },
  }),
};

export function SplitServices() {
  const truckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = truckRef.current;
    if (!el) return;
    const tween = gsap.to(el, {
      x: 12,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <section
      id="services"
      className="relative bg-diagonal-split px-4 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <motion.h2
          className="mb-12 text-center text-2xl font-extrabold uppercase tracking-wide text-navy md:text-3xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          What We Do
        </motion.h2>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <motion.article
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-navy/10 md:p-8"
            whileHover={{ scale: 1.015 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            <div className="mb-4 inline-block border-b-2 border-skybrand pb-1">
              <h3 className="text-lg font-extrabold uppercase tracking-wide text-navy md:text-xl">
                Cattle Feed &amp; Pellets
              </h3>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-navy/80">
              High-quality animal nutrition with balanced pellets for herd health
              and milk yield — bulk and retail supply with on-time delivery.
            </p>
            <p className="mb-6 rounded-lg border border-gold/40 bg-gold/15 px-3 py-2 text-xs font-bold text-navy">
              Featured: Saras Gold pellets (50&nbsp;kg) — ask for current rate
              (e.g. ₹1410; subject to market change)
            </p>
            <ul className="mb-6 space-y-3 text-sm font-medium text-navy">
              <motion.li
                custom={0}
                variants={item}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex gap-2"
              >
                <span className="text-skybrand">●</span>
                Saras Gold (pellets, typically 50&nbsp;kg bags)
              </motion.li>
              <motion.li
                custom={1}
                variants={item}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex gap-2"
              >
                <span className="text-skybrand">●</span>
                Pachranga &amp; Sara cattle feed
              </motion.li>
              <motion.li
                custom={2}
                variants={item}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex gap-2"
              >
                <span className="text-skybrand">●</span>
                Makhan Mishri — maize &amp; cottonseed-based mixes
              </motion.li>
            </ul>
            <motion.div
              className="relative aspect-[16/10] overflow-hidden rounded-xl"
              whileInView={{ scale: 1 }}
              initial={{ scale: 0.96 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/images/split-hero.jpeg"
                alt="Cattle feed branding and rural landscape"
                fill
                className="object-cover object-center transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </motion.article>

          <motion.article
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-navy/10 md:p-8"
            whileHover={{ scale: 1.015 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            <div className="mb-4 inline-block border-b-2 border-skybrand pb-1">
              <h3 className="text-lg font-extrabold uppercase tracking-wide text-navy md:text-xl">
                Milk Transport &amp; Manpower
              </h3>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-navy/80">
              Trained tanker operators, dairy staff, and end-to-end logistics
              from plant to booth — including work with Saras Dairy, Rajasthan.
            </p>
            <ul className="mb-6 space-y-3 text-sm font-medium text-navy">
              <li className="flex gap-2">
                <span className="text-skybrand">●</span>
                Trained manpower for dairies, processing &amp; testing
              </li>
              <li className="flex gap-2">
                <span className="text-skybrand">●</span>
                City supply — dairy plant to distribution points
              </li>
              <li className="flex items-start gap-2">
                <span ref={truckRef} className="inline-block text-xl">
                  🚛
                </span>
                <span>
                  Rao Milk transportation by tankers across Rajasthan &amp;
                  Maharashtra
                </span>
              </li>
            </ul>
            <motion.div
              className="relative aspect-[16/10] overflow-hidden rounded-xl"
              initial={{ filter: "blur(6px)", opacity: 0.85 }}
              whileInView={{ filter: "blur(0px)", opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <Image
                src="/images/corporate-flyer.jpeg"
                alt="Dairy logistics and industrial feed operations"
                fill
                className="object-cover object-center transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </motion.article>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="inline-flex rounded-full bg-navy px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-md ring-2 ring-navy/10 transition hover:bg-navy-deep"
          >
            View detailed services →
          </Link>
        </div>
      </div>
    </section>
  );
}
