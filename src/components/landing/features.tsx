"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { FEATURES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TAG_VARIANT: Record<string, "accent" | "green" | "blue" | "orange" | "default"> = {
  Core: "accent",
  Intelligence: "blue",
  Security: "green",
  DevOps: "orange",
  AI: "accent",
  Workflow: "default",
  Platform: "default",
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function Features() {
  return (
    <section id="features" className="section-padding">
      <Container>
        <SectionHeader
          eyebrow="Features"
          title="Everything you need to"
          titleAccent="understand any codebase."
          description="From a single command to a complete picture of your repository's health, architecture, and potential — powered by state-of-the-art AI models."
          className="mb-16"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.id} variants={cardVariants}>
                <div className="card-feature group h-full cursor-default">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.07] bg-accent-soft text-accent-mid transition-all group-hover:border-accent-border group-hover:bg-accent/[0.15]">
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                    </div>
                    {feature.tag && (
                      <Badge variant={TAG_VARIANT[feature.tag] ?? "default"}>
                        {feature.tag}
                      </Badge>
                    )}
                  </div>

                  <h3 className="mb-2 font-display text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground-sub">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
