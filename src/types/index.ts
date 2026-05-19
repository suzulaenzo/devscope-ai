/* ─── Navigation ─────────────────────────────── */
export interface NavItem {
    label: string;
    href: string;
    external?: boolean;
  }
  
  /* ─── Features ───────────────────────────────── */
  export interface Feature {
    id: string;
    icon: React.ElementType;
    title: string;
    description: string;
    tag?: string;
  }
  
  /* ─── Stats ──────────────────────────────────── */
  export interface Stat {
    value: string;
    label: string;
    description?: string;
  }
  
  /* ─── Pricing ────────────────────────────────── */
  export type PricingInterval = "monthly" | "annually";
  
  export interface PricingTier {
    id: string;
    name: string;
    price: { monthly: number | null; annually: number | null };
    description: string;
    features: string[];
    cta: string;
    highlighted?: boolean;
    badge?: string;
  }
  
  /* ─── Analysis ───────────────────────────────── */
  export interface AnalysisScore {
    label: string;
    value: number;
    color: string;
  }
  
  export interface AnalysisResult {
    repo: string;
    duration: string;
    stack: {
      language: string;
      percentage: number;
      framework: string;
      runtime: string;
      styling: string;
    };
    architecture: {
      pattern: string;
      structure: string;
      testing: string;
      cicd: string;
    };
    scores: AnalysisScore[];
    overall: number;
  }
  
  /* ─── Testimonial ────────────────────────────── */
  export interface Testimonial {
    quote: string;
    author: string;
    role: string;
    company: string;
    avatar?: string;
  }