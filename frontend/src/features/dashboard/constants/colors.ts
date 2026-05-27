export const C = {
  green:         "#1f7a4a",
  orange:        "#d97a2c",
  red:           "#d7553a",
  bg:            "#f5f1ea",
  card:          "#ffffff",
  border:        "#ece6d8",
  text:          "#1a1f1c",
  muted:         "#5e6b62",
  sidebar:       "#0f2e1f",
  sidebarText:   "#a8c1b1",
  sidebarActive: "#1a4632",
} as const;

export const cardStyle = {
  background:   C.card,
  borderRadius: 16,
  border:       `1px solid ${C.border}`,
  padding:      20,
  boxShadow:    "0 1px 2px rgba(0,0,0,0.03)",
} as const;

export const btnOutlineStyle = {
  display:     "flex",
  alignItems:  "center",
  gap:         6,
  background:  "#fff",
  border:      `1px solid ${C.border}`,
  borderRadius: 10,
  padding:     "8px 14px",
  fontSize:    13,
  cursor:      "pointer",
  color:       C.text,
  boxShadow:   "0 1px 2px rgba(0,0,0,0.04)",
} as const;
