import React from "react";

const stack = [
  "ESP32",
  "MAX30102",
  "MLX90614",
  "MPU6050",
  "MQTT",
  "Painel Web",
  "Motor de Risco com IA",
];

const principles = [
  "Protótipo validado em campo",
  "Monitoramento contínuo por sensores",
  "Lógica de alertas explicável",
  "Plataforma alinhada à LGPD",
  "Colaboração entre produtor e veterinário",
];

export const TrustSection: React.FC = () => {
  return (
    <section className="relative bg-background py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-forest">
              <span className="h-px w-6 bg-forest/40" />
              Ciência &amp; confiança
            </div>
            <h2 className="font-display text-4xl leading-[1.02] text-balance max-w-3xl sm:text-5xl lg:text-6xl text-foreground">
              Construída sobre observação de campo,
              <br />
              <span className="italic text-forest">
                sistemas embarcados e lógica veterinária.
              </span>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              A CowHealth AI foi projetada a partir de desafios reais de fazendas leiteiras —
              combinando sensoriamento embarcado, arquitetura IoT, regras heurísticas de saúde e
              uma abordagem que prioriza o bem-estar animal.
            </p>
          </div>

          <ul className="grid content-center gap-3">
            {principles.map((p) => (
              <li
                key={p}
                className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 text-sm text-foreground"
              >
                <span className="grid h-7 w-7 place-items-center rounded-md bg-forest/10 text-forest flex-shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-20 rounded-2xl border border-border bg-card p-8 lg:p-10">
          <div className="mb-6 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Stack tecnológico
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {stack.map((s, i) => (
              <div key={s} className="flex items-center gap-8">
                <span className="font-display text-2xl text-foreground/85">{s}</span>
                {i < stack.length - 1 && <span className="text-foreground/15">·</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
