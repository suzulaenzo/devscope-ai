"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  titleAccent,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="tag-badge">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
          {eyebrow}
        </span>
      )}

      <h2
        className={cn(
          "font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl",
          align === "center" && "max-w-3xl text-balance"
        )}
      >
        <span className="gradient-text">{title}</span>
        {titleAccent && (
          <>
            {" "}
            <span className="gradient-text-accent">{titleAccent}</span>
          </>
        )}
      </h2>

      {description && (
        <p
          className={cn(
            "text-foreground-sub leading-relaxed",
            align === "center" && "max-w-2xl",
            "text-base md:text-lg"
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
