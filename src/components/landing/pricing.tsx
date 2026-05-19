"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRICING_TIERS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PricingInterval } from "@/types";

export function Pricing() {
  const [interval, setInterval] = useState<PricingInterval>("monthly");

  return (
    <section id="pricing" className="section-padding">
      <Container>
        <SectionHeader
          eyebrow="Pricing"
          title="Simple, transparent"
          titleAccent="pricing."
          description="Start free. Scale as your team grows. No hidden fees, no usage surprises."
          className="mb-12"
        />

        {/* Interval toggle */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-lg border border-white/[0.07] bg-surface p-1">
            {(["monthly", "annually"] as PricingInterval[]).map((option) => (
              <button
                key={option}
                onClick={() => setInterval(option)}
                className={cn(
                  "relative rounded-md px-5 py-2 text-sm font-medium capitalize transition-all duration-200",
                  interval === option
                    ? "bg-accent text-white shadow-glow-sm"
                    : "text-foreground-sub hover:text-foreground"
                )}
              >
                {option}
                {option === "annually" && (
                  <span className="ml-1.5 rounded-full bg-status-green/20 px-1.5 py-0.5 text-[10px] font-semibold text-status-green">
                    −25%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {PRICING_TIERS.map((tier, i) => {
            const price = tier.price[interval];
            const isPopular = tier.highlighted;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-7 transition-all duration-300",
                  isPopular
                    ? "border-accent/40 bg-accent-soft shadow-glow-sm"
                    : "border-white/[0.07] bg-surface hover:border-white/[0.12]"
                )}
              >
                {/* Popular badge */}
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow-glow-sm">
                      <Zap className="h-3 w-3" />
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <h3 className="mb-1 font-display text-base font-bold text-foreground">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-foreground-sub">{tier.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${tier.id}-${interval}`}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-end gap-1"
                    >
                      {price === null || price === 0 ? (
                        <span className="font-display text-4xl font-bold text-foreground">
                          {price === 0 ? "Free" : "Custom"}
                        </span>
                      ) : (
                        <>
                          <span className="mb-1 text-lg text-foreground-muted">$</span>
                          <span className="font-display text-4xl font-bold gradient-text">
                            {price}
                          </span>
                          <span className="mb-1 text-sm text-foreground-muted">/mo</span>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  {price !== null && price > 0 && interval === "annually" && (
                    <p className="mt-1 text-xs text-foreground-muted">
                      Billed annually · Save ${(tier.price.monthly! - price) * 12}/yr
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Button
                  variant={isPopular ? "primary" : "ghost"}
                  className="mb-7 w-full"
                >
                  <Link href="/signup">{tier.cta}</Link>
                </Button>

                {/* Features */}
                <ul className="flex flex-col gap-2.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 flex-shrink-0",
                          isPopular ? "text-accent-mid" : "text-foreground-muted"
                        )}
                      />
                      <span className="text-sm text-foreground-sub">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Enterprise note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 text-center text-sm text-foreground-muted"
        >
          Need a custom enterprise plan?{" "}
          <Link
            href="/enterprise"
            className="text-accent-mid underline-offset-4 hover:underline"
          >
            Talk to our sales team →
          </Link>
        </motion.p>
      </Container>
    </section>
  );
}
