"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { SITE } from "@/lib/site";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const subject = encodeURIComponent(`Enquiry — ${SITE.shortName}`);
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\n\n${message}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setSent(true);
    form.reset();
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="mx-auto max-w-lg rounded-2xl border border-navy/10 bg-white p-6 shadow-xl ring-1 ring-navy/5 md:p-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <p className="text-sm font-bold uppercase tracking-wide text-navy-muted">
        Send a message
      </p>
      <p className="mt-1 text-xs text-navy/60">
        Opens your email app with this message. You can also call or WhatsApp
        directly.
      </p>
      <label className="mt-5 block text-sm font-semibold text-navy">
        Name
        <input
          name="name"
          required
          className="mt-1.5 w-full rounded-lg border border-navy/15 bg-cream px-3 py-2.5 text-sm outline-none ring-skybrand/30 focus:ring-2"
          placeholder="Your name"
        />
      </label>
      <label className="mt-4 block text-sm font-semibold text-navy">
        Phone
        <input
          name="phone"
          type="tel"
          required
          className="mt-1.5 w-full rounded-lg border border-navy/15 bg-cream px-3 py-2.5 text-sm outline-none ring-skybrand/30 focus:ring-2"
          placeholder="10-digit mobile"
        />
      </label>
      <label className="mt-4 block text-sm font-semibold text-navy">
        Requirement
        <textarea
          name="message"
          required
          rows={4}
          className="mt-1.5 w-full resize-y rounded-lg border border-navy/15 bg-cream px-3 py-2.5 text-sm outline-none ring-skybrand/30 focus:ring-2"
          placeholder="Feed quantity, dairy route, manpower — brief details"
        />
      </label>
      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-navy py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg transition hover:bg-navy-deep"
      >
        Open email draft
      </button>
      {sent ? (
        <p className="mt-3 text-center text-xs font-medium text-green-700">
          If your mail app opened, you’re set — otherwise use the numbers
          above.
        </p>
      ) : null}
    </motion.form>
  );
}
