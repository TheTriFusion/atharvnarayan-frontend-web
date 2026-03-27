"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function GalleryStrip() {
  return (
    <section className="bg-cream px-4 py-14 md:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          className="mb-10 text-center text-xl font-extrabold uppercase text-navy md:text-2xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          On the ground
        </motion.h2>
        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-md ring-1 ring-navy/10"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/images/feed-brand.jpeg"
              alt="Saras Gold and cattle feed branding"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
          <motion.div
            className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-md ring-1 ring-navy/10"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Image
              src="/images/banner-alt.jpeg"
              alt="Manvinder Singh Enterprises promotional creative"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/gallery"
            className="text-sm font-bold text-skybrand underline-offset-4 hover:underline"
          >
            Open full gallery →
          </Link>
        </div>
      </div>
    </section>
  );
}
