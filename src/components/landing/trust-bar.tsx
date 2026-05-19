"use client";

import { motion } from "framer-motion";
import { TRUSTED_COMPANIES } from "@/lib/constants";

export function TrustBar() {
  return (
    <section className="border-y border-white/[0.05] py-10">
      <div className="mx-auto max-w-5xl px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-foreground-muted"
        >
          Trusted by engineers at
        </motion.p>

        <div className="relative overflow-hidden">
          {/* Gradient masks on edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
          >
            {TRUSTED_COMPANIES.map((company, i) => (
              <motion.span
                key={company}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                className="font-display text-sm font-semibold tracking-tight text-foreground-muted/50 transition-colors hover:text-foreground-muted cursor-default select-none"
              >
                {company}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
