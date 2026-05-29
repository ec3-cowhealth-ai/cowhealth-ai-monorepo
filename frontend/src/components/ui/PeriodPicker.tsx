import { C } from "@features/dashboard/constants/colors";
import { PERIOD_OPTIONS, type Period } from "@/types/period";

interface Props {
  value: Period;
  onChange: (period: Period) => void;
  customFrom?: string;
  customTo?: string;
  onCustomFromChange?: (v: string) => void;
  onCustomToChange?: (v: string) => void;
}

export const PeriodPicker = ({
  value,
  onChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: Props) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Pills — horizontally scrollable on mobile */}
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 2,
          scrollbarWidth: "none",
        }}
      >
        {PERIOD_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                flexShrink: 0,
                padding: "5px 14px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                border: `1px solid ${active ? C.green : C.border}`,
                background: active ? C.green : C.card,
                color: active ? "var(--primary-on, #fff)" : C.muted,
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Custom date range */}
      {value === "custom" && (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            type="date"
            value={customFrom ?? ""}
            onChange={(e) => onCustomFromChange?.(e.target.value)}
            style={{
              flex: "1 1 130px",
              minWidth: 0,
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.card,
              color: C.text,
              fontSize: 13,
            }}
          />
          <span style={{ color: C.muted, fontSize: 12, flexShrink: 0 }}>até</span>
          <input
            type="date"
            value={customTo ?? ""}
            onChange={(e) => onCustomToChange?.(e.target.value)}
            style={{
              flex: "1 1 130px",
              minWidth: 0,
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.card,
              color: C.text,
              fontSize: 13,
            }}
          />
        </div>
      )}
    </div>
  );
};
