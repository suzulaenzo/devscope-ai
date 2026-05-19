"use client";

import { motion } from "framer-motion";
import { ArrowRight, Hexagon, Sparkles } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared/container";

export function Cta() {
  return (
    <section className="py-24 md:py-32">
      <Container size="md">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-accent/25 bg-accent-soft px-8 py-16 text-center md:px-16"
        >
          {/* Background decorations */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/[0.08] blur-3xl" />
            <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-status-blue/[0.07] blur-3xl" />
          </div>

          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative inline-flex h-14 w-14 items-center justify-center">
              <Hexagon
                className="absolute h-14 w-14 text-accent opacity-20"
                strokeWidth={1}
              />
              <Sparkles className="h-6 w-6 text-accent-mid" strokeWidth={1.5} />
            </div>
          </div>

          {/* Copy */}
          <h2 className="relative font-display text-4xl font-bold tracking-tight text-balance md:text-5xl">
            <span className="gradient-text">Start analyzing</span>
            <br />
            <span className="gradient-text-accent">your codebase today.</span>
          </h2>
          <p className="relative mx-auto mt-5 max-w-lg text-base leading-relaxed text-foreground-sub md:text-lg">
            Join thousands of engineers who ship faster, with full confidence in their codebase's health and architecture.
          </p>

          {/* CTAs */}
          <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-glow-md transition-all hover:brightness-110 hover:shadow-glow-lg active:scale-[0.98]"
            >
              Get started for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] px-7 py-3.5 text-sm font-medium text-foreground-sub transition-all hover:bg-white/[0.05] hover:text-foreground"
            >
              Read the docs
            </Link>
          </div>

          {/* Fine print */}
          <p className="relative mt-6 text-xs text-foreground-muted">
            Free forever · No credit card · Setup in under 30 seconds
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
