"use client";

import { motion } from "framer-motion";

const items = [
  { code: "2309", label: "Animal feeding preparations" },
  { code: "23", label: "Residues & waste from food industries" },
  { code: "0401", label: "Milk & cream — dairy chain" },
];

export function ComplianceStrip() {
  return (
    <section className="border-y border-navy/10 bg-white px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <motion.p
          className="mb-6 text-center text-sm font-bold uppercase tracking-wider text-navy-muted"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Registration &amp; HSN alignment
        </motion.p>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((row, i) => (
            <motion.div
              key={row.code}
              className="rounded-lg bg-cream px-4 py-4 text-center ring-1 ring-navy/10"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-2xl font-extrabold text-skybrand">HSN {row.code}</p>
              <p className="mt-1 text-xs text-navy/70 md:text-sm">{row.label}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-navy/60">
          GSTIN:{" "}
          <span className="font-semibold text-navy">08FCAPS3631E1ZP</span>
        </p>
      </div>
    </section>
  );
}
