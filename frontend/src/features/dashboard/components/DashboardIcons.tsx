import type { CSSProperties } from "react";
import { C } from "../constants/colors";
import { CowHead } from "@components/ui/CowHeadIcon";

type SvgProps = { style?: CSSProperties; color?: string };

export function CowGlyph({ style }: SvgProps) {
  return (
    <svg
      aria-hidden="true"
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 11c0-3 2-5 7-5s7 2 7 5c0 1-.5 2-1 2.5V17a2 2 0 01-2 2h-1v-2H9v2H8a2 2 0 01-2-2v-3.5c-.5-.5-1-1.5-1-2.5z" />
      <path d="M9 14h.01M15 14h.01M4 9l-2-1M20 9l2-1" />
    </svg>
  );
}

export function TempIcon({ style }: SvgProps) {
  return (
    <svg aria-hidden="true" style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 3a2 2 0 012 2v7a3 3 0 11-4 0V5a2 2 0 012-2z" />
    </svg>
  );
}

export function HeartIcon({ style }: SvgProps) {
  return (
    <svg aria-hidden="true" style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 16s-6-3.5-6-8a3.5 3.5 0 016-2.5A3.5 3.5 0 0116 8c0 4.5-6 8-6 8z" />
    </svg>
  );
}

export function ShieldIcon({ style }: SvgProps) {
  return (
    <svg aria-hidden="true" style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 2l6 2v5c0 4-3 7-6 9-3-2-6-5-6-9V4l6-2z" />
      <path d="M7 10l2 2 4-4" />
    </svg>
  );
}

export function ChevronDown({ style }: SvgProps) {
  return (
    <svg aria-hidden="true" style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 8l5 5 5-5" />
    </svg>
  );
}

export function ChevronRight({ style }: SvgProps) {
  return (
    <svg aria-hidden="true" style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 5l5 5-5 5" />
    </svg>
  );
}

export function BellIcon({ style }: SvgProps) {
  return (
    <svg aria-hidden="true" style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 9a5 5 0 0110 0v3l1 2H4l1-2V9zM8 16a2 2 0 004 0" />
    </svg>
  );
}

export function CameraIcon({ style }: SvgProps) {
  return (
    <svg aria-hidden="true" style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="6" width="14" height="10" rx="2" />
      <circle cx="10" cy="11" r="2.5" />
      <path d="M7 6l1-2h4l1 2" />
    </svg>
  );
}

export function ActivityIcon({ style }: SvgProps) {
  return (
    <svg aria-hidden="true" style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 10h3l2-5 4 10 2-5h3" />
    </svg>
  );
}

export function ClockIcon({ style }: SvgProps) {
  return (
    <svg aria-hidden="true" style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="10" cy="10" r="6" />
      <path d="M10 7v3l2 1" />
    </svg>
  );
}

export function AlertTriangleIcon({ style }: SvgProps) {
  return (
    <svg aria-hidden="true" style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 3l8 14H2L10 3z" />
      <path d="M10 9v3M10 14v.5" />
    </svg>
  );
}

export function CalIcon({ style }: SvgProps) {
  return (
    <svg aria-hidden="true" style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="14" height="12" rx="1.5" />
      <path d="M3 8h14M7 3v4M13 3v4" />
    </svg>
  );
}

export function FilterIcon({ style }: SvgProps) {
  return (
    <svg aria-hidden="true" style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 5h14M5 10h10M8 15h4" />
    </svg>
  );
}

export function CheckIcon({ style }: SvgProps) {
  return (
    <svg aria-hidden="true" style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10l4 4 8-8" />
    </svg>
  );
}

export function FarmIcon({ style }: SvgProps) {
  return (
    <svg aria-hidden="true" style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 10L10 2l8 8v8H2V10z" />
      <path d="M7 18v-5h6v5" />
    </svg>
  );
}

export function GlobeIcon({ style }: SvgProps) {
  return (
    <svg aria-hidden="true" style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="10" cy="10" r="7" />
      <path d="M3 10h14M10 3c-2 2-3 4.5-3 7s1 5 3 7M10 3c2 2 3 4.5 3 7s-1 5-3 7" />
    </svg>
  );
}

export function KpiIcon({ name, color }: { name: string; color: string }) {
  const s = { width: 18, height: 18, color };
  switch (name) {
    case "shield":
      return <ShieldIcon style={s} />;
    case "heart":
      return <HeartIcon style={s} />;
    case "cow":
      return <CowHead size={18} color={color} />;
    case "circle":
      return (
        <svg aria-hidden="true" style={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="10" cy="10" r="6" />
          <path d="M10 4v3M10 13v3M4 10h3M13 10h3" />
        </svg>
      );
    case "temp":
      return <TempIcon style={s} />;
    default:
      return null;
  }
}

export function AlertFeedIcon({ name, color }: { name: string; color: string }) {
  const s = { width: 16, height: 16, color };
  switch (name) {
    case "temp":
      return <TempIcon style={s} />;
    case "heart":
      return <HeartIcon style={s} />;
    case "activity":
      return <ActivityIcon style={s} />;
    case "clock":
      return <ClockIcon style={s} />;
    default:
      return <BellIcon style={s} />;
  }
}

export function CheckDot({ ok }: { ok: boolean }) {
  const color = ok ? C.green : C.orange;
  const bg = ok ? "var(--status-success-bg)" : "var(--status-warning-bg)";
  return (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: 999,
        background: bg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg aria-hidden="true" viewBox="0 0 10 10" style={{ width: 8, height: 8 }}>
        <path
          d="M2 5 L4 7 L8 3"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
