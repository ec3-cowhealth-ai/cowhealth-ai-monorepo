import React from "react";

const steps = [
  {
    n: "01",
    title: "Sentir",
    body: "A coleira inteligente captura sinais vitais e comportamentais de cada vaca, de forma contínua.",
  },
  {
    n: "02",
    title: "Analisar",
    body: "A CowHealth AI processa os dados com regras transparentes e inteligência preditiva.",
  },
  {
    n: "03",
    title: "Alertar",
    body: "Produtores e veterinários recebem indicadores claros de risco e níveis recomendados de atenção.",
  },
];

const pipeline = ["Vaca", "Coleira Inteligente", "MQTT / Nuvem", "Painel", "Ação Veterinária"];

export const SolutionSection: React.FC = () => {
  return (
    <section id="solution" className="relative bg-gradient-forest py-28 text-cream lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-signal">
          <span className="h-px w-6 bg-signal/40" />
          A solução
        </div>
        <h2 className="font-display text-4xl leading-[1.02] text-cream text-balance max-w-3xl sm:text-5xl lg:text-6xl">
          Dos sinais da vaca
          <br />
          <span className="italic text-cream/70">a decisões acionáveis.</span>
        </h2>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-cream/10 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="bg-forest-deep p-8 lg:p-10">
              <div className="text-xs font-medium tracking-widest text-signal">{s.n}</div>
              <h3 className="mt-8 font-display text-3xl text-cream">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-cream/70">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-cream/15 bg-forest-deep/40 p-6 lg:p-8">
          <div className="mb-5 text-[11px] uppercase tracking-[0.22em] text-cream/60">
            Pipeline de dados
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {pipeline.map((p, i) => (
              <div key={p} className="flex items-center gap-3">
                <span className="rounded-full border border-cream/20 bg-cream/5 px-4 py-2 text-cream/90">
                  {p}
                </span>
                {i < pipeline.length - 1 && (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-cream/40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14m-5-5 5 5-5 5" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
