import React from "react";
import type { ReactElement } from "react";

type Severity = "baixo" | "moderado" | "alto";

const risks: { label: string; signals: string; severity: Severity; icon: string }[] = [
  {
    label: "Estresse respiratório",
    signals: "Temperatura · Frequência cardíaca · Atividade",
    severity: "alto",
    icon: "lung",
  },
  {
    label: "Alerta sistêmico de mastite",
    signals: "Temperatura · Postura · Atividade",
    severity: "alto",
    icon: "shield",
  },
  {
    label: "Estresse térmico",
    signals: "Temperatura · Movimentação",
    severity: "moderado",
    icon: "sun",
  },
  {
    label: "Claudicação / atividade reduzida",
    signals: "Postura · Padrões de movimento",
    severity: "moderado",
    icon: "footprints",
  },
  {
    label: "Padrão comportamental de cetose",
    signals: "Atividade · Indicadores de ruminação",
    severity: "moderado",
    icon: "drop",
  },
  {
    label: "Atenção pré-parto",
    signals: "Atividade · Alterações de postura",
    severity: "baixo",
    icon: "calendar",
  },
  {
    label: "Risco de desidratação / choque",
    signals: "Frequência cardíaca · Temperatura",
    severity: "alto",
    icon: "alert",
  },
];

const sevStyles: Record<Severity, string> = {
  baixo: "bg-signal/15 text-forest border-signal/30",
  moderado: "bg-amber-500/10 text-amber-400 border-amber-400/30",
  alto: "bg-destructive/10 text-destructive border-destructive/30",
};

function RiskIcon({ name }: { name: string }) {
  const paths: Record<string, ReactElement> = {
    lung: (
      <path d="M12 4v9m-4 7a4 4 0 0 1-4-4V9a3 3 0 0 1 5-2m7 13a4 4 0 0 0 4-4V9a3 3 0 0 0-5-2" />
    ),
    shield: <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3z" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    footprints: (
      <path d="M7 4c-1.5 0-2.5 2-2.5 4s.5 4 2 4 2-2 2-4-.5-4-1.5-4zm10 6c-1.5 0-2.5 2-2.5 4s.5 4 2 4 2-2 2-4-.5-4-1.5-4z" />
    ),
    drop: <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4m8-4v4" />
      </>
    ),
    alert: (
      <>
        <path d="M12 3 2 21h20L12 3z" />
        <path d="M12 10v5m0 3v.5" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export const IntelligenceSection: React.FC = () => {
  return (
    <section id="technology" className="relative bg-secondary/60 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-forest">
          <span className="h-px w-6 bg-forest/40" />
          Inteligência de saúde
        </div>
        <h2 className="font-display text-4xl leading-[1.02] text-balance max-w-3xl sm:text-5xl lg:text-6xl text-foreground">
          Inteligência transparente,
          <br />
          <span className="italic text-forest">sem caixa-preta.</span>
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          A CowHealth AI combina limiares fisiológicos, padrões comportamentais e tendências
          históricas para gerar alertas de risco explicáveis — projetados para apoiar o julgamento
          veterinário com sinais claros e auditáveis.
        </p>

        <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {risks.map((r) => (
            <div
              key={r.label}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-forest/10 text-forest">
                  <RiskIcon name={r.icon} />
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${sevStyles[r.severity]}`}
                >
                  {r.severity}
                </span>
              </div>
              <h3 className="mt-8 font-display text-xl leading-tight text-foreground">{r.label}</h3>
              <div className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                Sinais monitorados
              </div>
              <div className="mt-1 text-sm text-foreground/80">{r.signals}</div>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-sm text-muted-foreground">
          Os indicadores de risco apoiam — mas não substituem — o diagnóstico veterinário. Cada
          alerta é auditável e rastreável até os sinais que o originaram.
        </p>
      </div>
    </section>
  );
};
