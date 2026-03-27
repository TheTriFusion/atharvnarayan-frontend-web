"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const products = [
  { name: "Milk", detail: "Fresh bulk & packaged movement" },
  { name: "Ghee", detail: "Traditional & dairy-grade supply" },
  { name: "Dahi", detail: "Curd for retail & institutions" },
  { name: "Chaach", detail: "Buttermilk — seasonal demand" },
  { name: "Paneer", detail: "Soft paneer for kitchens & trade" },
  { name: "Other dairy", detail: "Aligned with your distribution lanes" },
];

type ProductsSectionProps = {
  showPageLink?: boolean;
  /** `light` suits standalone /products page under PageHero */
  variant?: "dark" | "light";
};

export function ProductsSection({
  showPageLink = true,
  variant = "dark",
}: ProductsSectionProps) {
  const isDark = variant === "dark";

  return (
    <section
      id="products"
      className={`px-4 py-16 md:py-24 ${
        isDark ? "bg-navy text-white" : "bg-cream text-navy"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <motion.h2
          className="mb-4 text-center text-2xl font-extrabold uppercase tracking-wide md:text-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Dairy Products — Selling &amp; Transporting
        </motion.h2>
        <p
          className={`mx-auto mb-12 max-w-2xl text-center text-sm md:text-base ${
            isDark ? "text-white/80" : "text-navy/75"
          }`}
        >
          We support movement and trade of everyday dairy essentials alongside
          our logistics footprint — structured for quality and timeliness.
        </p>
        <div
          className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
            showPageLink ? "mb-10" : ""
          }`}
        >
          {products.map((p, i) => (
            <motion.div
              key={p.name}
              className={
                isDark
                  ? "rounded-xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm"
                  : "rounded-xl border border-navy/10 bg-white p-5 shadow-md ring-1 ring-navy/5"
              }
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={{
                y: -4,
                borderColor: isDark
                  ? "rgba(255,204,0,0.5)"
                  : "rgba(0,51,102,0.25)",
              }}
            >
              <h3
                className={`text-lg font-bold ${
                  isDark ? "text-gold" : "text-navy"
                }`}
              >
                {p.name}
              </h3>
              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-white/75" : "text-navy/75"
                }`}
              >
                {p.detail}
              </p>
            </motion.div>
          ))}
        </div>
        {showPageLink ? (
          <div className="text-center">
            <Link
              href="/products"
              className="inline-flex rounded-full border border-gold/50 bg-white/10 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-gold transition hover:bg-white/15"
            >
              Full dairy products page →
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
