export const C = {
  green: "var(--primary)",
  orange: "var(--warning)",
  red: "var(--danger)",
  bg: "var(--bg-app)",
  card: "var(--bg-elev-1)",
  border: "var(--border)",
  text: "var(--text-primary)",
  muted: "var(--text-muted)",
  sidebar: "var(--sidebar-bg)",
  sidebarText: "var(--sidebar-text)",
  sidebarActive: "var(--sidebar-active)",
} as const;

export const cardStyle = {
  background: C.card,
  borderRadius: 16,
  border: `1px solid ${C.border}`,
  padding: 20,
  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
} as const;

export const btnOutlineStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "var(--bg-elev-1)",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "8px 14px",
  fontSize: 13,
  cursor: "pointer",
  color: C.text,
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
} as const;
