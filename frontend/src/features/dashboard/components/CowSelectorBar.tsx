import { useEffect } from "react";
import type { CowListItem } from "@/types/cows";
import type { Farm } from "@/types/farms";
import type { Notification } from "@hooks/useNotifications";
import { C, cardStyle } from "../constants/colors";
import { FarmIcon, GlobeIcon, BellIcon, ChevronDown } from "./DashboardIcons";

export type SelectionMode = "farm" | "global" | "alert";

interface Props {
  mode: SelectionMode;
  onModeChange: (mode: SelectionMode) => void;
  selectedCowId: string | null;
  onCowSelect: (cowId: string) => void;
  cowList: CowListItem[];
  farms: Farm[];
  selectedFarmId: string | null;
  onFarmChange: (farmId: string) => void;
  alerts: Notification[];
  isLoadingCows: boolean;
}

const MODES: { key: SelectionMode; label: string; Icon: typeof FarmIcon }[] = [
  { key: "farm", label: "Por Fazenda", Icon: FarmIcon },
  { key: "global", label: "Global", Icon: GlobeIcon },
  { key: "alert", label: "Último Alerta", Icon: BellIcon },
];

export function CowSelectorBar({
  mode,
  onModeChange,
  selectedCowId,
  onCowSelect,
  cowList,
  farms,
  selectedFarmId,
  onFarmChange,
  alerts,
  isLoadingCows,
}: Props) {
  // Auto-select cow for alert mode
  useEffect(() => {
    if (mode !== "alert") return;
    const first = alerts.find((a) => a.cowId);
    if (first?.cowId) onCowSelect(first.cowId);
  }, [mode, alerts, onCowSelect]);

  const alertCow = mode === "alert" ? cowList.find((c) => String(c.id) === selectedCowId) : null;

  return (
    <div style={{ ...cardStyle }}>
      {/* Mode toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginRight: 4 }}>
          Seleção de vaca:
        </span>
        {MODES.map(({ key, label, Icon }) => {
          const active = mode === key;
          return (
            <button
              key={key}
              onClick={() => onModeChange(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                border: `1px solid ${active ? C.green : C.border}`,
                background: active ? C.green : C.card,
                color: active ? "var(--primary-on)" : C.muted,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <Icon style={{ width: 13, height: 13 }} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Farm selector (mode: farm) */}
      {mode === "farm" && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <select
              value={selectedFarmId ?? ""}
              onChange={(e) => onFarmChange(e.target.value)}
              style={{
                appearance: "none",
                padding: "7px 32px 7px 12px",
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: C.card,
                fontSize: 13,
                color: C.text,
                cursor: "pointer",
                minWidth: 180,
              }}
            >
              <option value="" disabled>
                Selecionar fazenda…
              </option>
              {farms.map((f) => (
                <option key={f.id} value={String(f.id)}>
                  {f.name}
                </option>
              ))}
            </select>
            <ChevronDown
              style={{
                width: 14,
                height: 14,
                color: C.muted,
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
          </div>
          {selectedFarmId && (
            <span style={{ fontSize: 12, color: C.muted }}>
              {isLoadingCows ? "Carregando…" : `${cowList.length} vaca(s)`}
            </span>
          )}
        </div>
      )}

      {/* Cow list (mode: farm or global) */}
      {(mode === "farm" || mode === "global") && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {isLoadingCows ? (
            <span style={{ fontSize: 12, color: C.muted }}>Carregando vacas…</span>
          ) : cowList.length === 0 ? (
            <span style={{ fontSize: 12, color: C.muted }}>
              {mode === "farm" && !selectedFarmId
                ? "Selecione uma fazenda para ver as vacas."
                : "Nenhuma vaca encontrada."}
            </span>
          ) : (
            cowList.map((cow) => {
              const selected = String(cow.id) === selectedCowId;
              const statusColor =
                cow.status === "ALERT" || cow.status === "HEAT_STRESS" ? C.orange : C.green;
              return (
                <button
                  key={cow.id}
                  onClick={() => onCowSelect(String(cow.id))}
                  style={{
                    flexShrink: 0,
                    padding: "6px 12px",
                    borderRadius: 10,
                    border: `1px solid ${selected ? C.green : C.border}`,
                    background: selected ? "var(--status-success-bg)" : C.card,
                    cursor: "pointer",
                    fontSize: 12,
                    color: selected ? C.green : C.text,
                    fontWeight: selected ? 600 : 400,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: statusColor,
                      flexShrink: 0,
                    }}
                  />
                  {cow.tag}
                  {cow.name && cow.name !== cow.tag && (
                    <span style={{ color: C.muted, fontWeight: 400 }}>— {cow.name}</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Alert mode info */}
      {mode === "alert" && (
        <div
          style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}
        >
          {selectedCowId ? (
            <>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: C.orange,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: C.text }}>
                Selecionada automaticamente:{" "}
                <strong>
                  {alertCow
                    ? `${alertCow.tag}${alertCow.name !== alertCow.tag ? ` — ${alertCow.name}` : ""}`
                    : `ID ${selectedCowId}`}
                </strong>
              </span>
              <span style={{ fontSize: 11, color: C.muted }}>
                ({alerts.find((a) => a.cowId === selectedCowId)?.title ?? "último alerta"})
              </span>
            </>
          ) : (
            <span style={{ color: C.muted }}>
              {alerts.length === 0 ? "Nenhum alerta com vaca associada." : "Carregando…"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
