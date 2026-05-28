import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { Bell, User, ShieldCheck, ChevronRight } from "lucide-react";
import { C, cardStyle } from "@features/dashboard/constants/colors";

const STORAGE_KEY = "cowhealth_notification_prefs";

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as NotificationPrefs;
  } catch {
    // ignore
  }
  return { critical: true, warnings: true, dailySummary: false };
};

interface NotificationPrefs {
  critical: boolean;
  warnings: boolean;
  dailySummary: boolean;
}

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, description, value, onChange }: ToggleRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 14, color: C.text, fontWeight: 500 }}>{label}</p>
        {description && (
          <p style={{ margin: "2px 0 0 0", fontSize: 12, color: C.muted }}>{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          background: value ? "var(--success)" : C.border,
          position: "relative",
          flexShrink: 0,
          transition: "background 0.2s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: value ? 23 : 3,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
          }}
        />
      </button>
    </div>
  );
}

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadPrefs);

  const updatePref = (key: keyof NotificationPrefs) => (value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <div style={{ background: C.bg, minHeight: "100%" }}>
      <AppBar title="Configurações" showBack />

      <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Notificações */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Bell size={16} color={C.muted} />
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Notificações
            </p>
          </div>
          <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
            <ToggleRow
              label="Alertas críticos"
              description="Parto iminente, estresse térmico"
              value={prefs.critical}
              onChange={updatePref("critical")}
            />
            <ToggleRow
              label="Avisos"
              description="Parâmetros fora do intervalo"
              value={prefs.warnings}
              onChange={updatePref("warnings")}
            />
            <ToggleRow
              label="Resumo diário"
              description="Relatório às 8h com status do rebanho"
              value={prefs.dailySummary}
              onChange={updatePref("dailySummary")}
            />
          </div>
        </div>

        {/* Conta */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <User size={16} color={C.muted} />
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Conta
            </p>
          </div>
          <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
            <button
              onClick={() => navigate("/profile")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "14px 16px",
                background: "none",
                border: "none",
                borderBottom: `1px solid ${C.border}`,
                cursor: "pointer",
                color: C.text,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <User size={16} color={C.green} />
                <span style={{ fontSize: 14 }}>Editar perfil</span>
              </div>
              <ChevronRight size={16} color={C.muted} />
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "14px 16px",
              }}
            >
              <ShieldCheck size={16} color={C.muted} style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: 14, color: C.text, fontWeight: 500 }}>Privacidade (LGPD)</p>
                <p style={{ margin: "4px 0 0 0", fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                  Os dados coletados são utilizados exclusivamente para monitoramento de saúde animal
                  e gestão de rebanho, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
