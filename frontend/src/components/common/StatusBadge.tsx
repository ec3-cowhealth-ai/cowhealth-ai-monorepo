import type { ReactNode } from "react";

interface StatusBadgeProps {
  tone: "success" | "warning" | "danger" | "muted" | "info";
  children: ReactNode;
  showDot?: boolean;
}

export const StatusBadge = ({ tone, children, showDot = true }: StatusBadgeProps) => {
  return (
    <span className={`status-badge status-badge--${tone}`}>
      {showDot && <span className="status-badge__dot" />}
      {children}
    </span>
  );
};
