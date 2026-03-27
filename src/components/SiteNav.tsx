"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS, SITE } from "@/lib/site";

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      className="sticky top-0 z-50 border-b border-navy/10 bg-white/85 shadow-sm backdrop-blur-lg"
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:py-3.5">
        <Link
          href="/"
          className="group flex items-center gap-2"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-black text-white shadow-md ring-2 ring-skybrand/40 transition group-hover:ring-gold/60">
            MSE
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-skybrand">
              {SITE.shortName}
            </span>
            <span className="text-xs font-extrabold uppercase text-navy">
              {SITE.name.split(" ").slice(0, 2).join(" ")}
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex lg:gap-2">
          {NAV_LINKS.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-navy text-white shadow-inner"
                      : "text-navy/80 hover:bg-cream hover:text-navy"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-navy/15 bg-white md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`block h-0.5 w-5 rounded bg-navy transition ${open ? "translate-y-[5px] rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 rounded bg-navy transition ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 rounded bg-navy transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="border-t border-navy/10 bg-white md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ul className="flex flex-col gap-1 px-4 py-3">
              {NAV_LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={l.href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-navy hover:bg-cream"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.nav>
  );
}
