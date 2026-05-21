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

/** Validate GitHub URL or owner/repo shorthand */
export function isValidGithubUrl(url: string): boolean {
  const s = url.trim();
  if (/^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+(\/.*)?$/.test(s))
    return true;
  if (/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+(\/.*)?$/.test(s)) return true;
  return false;
}

/** Extract owner/repo from GitHub URL or owner/repo shorthand */
export function parseGithubUrl(
  url: string
): { owner: string; repo: string } | null {
  const s = url.trim().replace(/\/$/, "");

  // Full URL
  const urlMatch = s.match(
    /github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/
  );
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };

  // owner/repo shorthand
  const shortMatch = s.match(/^([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2] };

  return null;
}
