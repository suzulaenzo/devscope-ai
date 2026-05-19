import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind classes safely */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format large numbers with compact notation */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Delay utility for async flows */
export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Validate GitHub URL */
export function isValidGithubUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/?$/.test(
    url.trim()
  );
}

/** Extract owner/repo from GitHub URL */
export function parseGithubUrl(
  url: string
): { owner: string; repo: string } | null {
  const match = url.match(
    /github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}