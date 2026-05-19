import { Hexagon } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared/container";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "/changelog" },
    { label: "Roadmap", href: "/roadmap" },
  ],
  Developers: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/docs/api" },
    { label: "GitHub", href: "https://github.com/devscopeai" },
    { label: "Status", href: "/status" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Security", href: "/security" },
    { label: "Cookies", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] pb-10 pt-16">
      <Container>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <div className="relative flex h-7 w-7 items-center justify-center">
                <Hexagon
                  className="absolute h-7 w-7 text-accent opacity-20"
                  strokeWidth={1}
                />
                <Hexagon
                  className="h-4.5 w-4.5 text-accent-mid"
                  strokeWidth={2}
                  fill="rgba(124,109,248,0.1)"
                />
              </div>
              <span className="font-display text-sm font-semibold text-foreground">
                DevScope<span className="text-accent-mid"> AI</span>
              </span>
            </Link>
            <p className="max-w-[180px] text-xs leading-relaxed text-foreground-muted">
              AI-powered GitHub repository analysis for modern engineering teams.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground-muted">
                {group}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.05] pt-8 sm:flex-row">
          <p className="text-xs text-foreground-muted">
            © {new Date().getFullYear()} DevScope AI, Inc. All rights reserved.
          </p>
          <p className="text-xs text-foreground-muted">
            Built with{" "}
            <span className="text-accent-mid">Next.js</span> ·{" "}
            <span className="text-accent-mid">TypeScript</span> ·{" "}
            <span className="text-accent-mid">Tailwind CSS</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
