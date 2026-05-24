interface CowMarkProps {
  s?: number;
  primary?: string;
  accent?: string;
}

export const CowMark = ({
  s = 28,
  primary = "var(--verdigris)",
  accent = "var(--pearl-aqua)",
}: CowMarkProps) => (
  <svg width={s} height={s} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path
      d="M8 14c0-4 3-7 7-7h10c4 0 7 3 7 7v3c0 5-3 9-7 11-1 .5-2 1-3 1h-4c-1 0-2-.5-3-1-4-2-7-6-7-11v-3Z"
      stroke={primary}
      strokeWidth="2"
    />
    <path
      d="M8 14c-2 0-3-1-3-3s1-3 2-3M32 14c2 0 3-1 3-3s-1-3-2-3"
      stroke={primary}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="16" cy="18" r="1.4" fill={primary} />
    <circle cx="24" cy="18" r="1.4" fill={primary} />
    <path
      d="M18 24c.5.7 1.2 1 2 1s1.5-.3 2-1"
      stroke={primary}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M28 5c1 1.2 2 1.2 3 .5M30 7c.5 1 1.5 1.5 2.5 1"
      stroke={accent}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
