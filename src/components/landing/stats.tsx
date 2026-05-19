"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/container";
import { STATS } from "@/lib/constants";

export function Stats() {
  return (
    <section className="py-20">
      <Container>
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-surface">
          <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.06] lg:grid-cols-4 lg:divide-y-0">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-col items-center justify-center gap-1 p-8 text-center"
              >
                <span className="font-display text-4xl font-bold gradient-text-accent md:text-5xl">
                  {stat.value}
                </span>
                <span className="text-sm font-medium text-foreground">{stat.label}</span>
                {stat.description && (
                  <span className="text-xs text-foreground-muted">{stat.description}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
