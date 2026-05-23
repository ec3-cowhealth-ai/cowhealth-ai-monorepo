import type { CSSProperties } from "react";

export const ICONS: Record<string, string> = {
  bell: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0",
  search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35",
  home: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  alert: "M12 9v4M12 17h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z",
  map: "M9 4 3 7v13l6-3 6 3 6-3V4l-6 3-6-3ZM9 4v13M15 7v13",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  wifi: "M5 12.55a11 11 0 0 1 14 0M2 8.82a15 15 0 0 1 20 0M8.5 16.43a6 6 0 0 1 7 0M12 20h.01",
  wifiOff: "M2 2 22 22M8.5 16.43a6 6 0 0 1 7 0M19 12.55a11 11 0 0 0-3.47-2.17M2 8.82a15 15 0 0 1 4.17-2.65M5 12.55a11 11 0 0 1 5.17-2.39M22 8.82a15 15 0 0 0-11.18-3.78M12 20h.01",
  signal: "M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16",
  arrowUp: "M12 19V5M5 12l7-7 7 7",
  arrowDown: "M12 5v14M5 12l7 7 7-7",
  calendar: "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2ZM3 10h18M8 2v4M16 2v4",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  chevronLeft: "m15 18-6-6 6-6",
  chevronRight: "m9 6 6 6-6 6",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3Z",
  plus: "M12 5v14M5 12h14",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  check: "m5 12 5 5L20 7",
  thermo: "M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0Z",
  heart: "M3.5 12h3l2-5 4 10 2-5h6",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  battery: "M3 7h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3ZM22 11v2",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  farm: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  collar: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2ZM12 8v4M12 16h.01",
};

interface IconProps {
  n: string;
  s?: number;
  c?: string;
  sw?: number;
  style?: CSSProperties;
}

export const Icon = ({ n, s = 18, c = "currentColor", sw = 1.6, style }: IconProps) => {
  const d = ICONS[n] ?? "";
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {d.split(" M").map((seg, i) => (
        <path key={i} d={(i ? "M" : "") + seg} />
      ))}
    </svg>
  );
};
