import React from "react";

const cards = [
  {
    title: "Sinais ocultos de saúde",
    body: "Mudanças sutis de temperatura, postura e pulsação aparecem dias antes dos sintomas visíveis — e a observação rotineira costuma passar despercebida.",
  },
  {
    title: "Intervenção tardia",
    body: "Quando a vaca já parece doente, a janela ideal de tratamento pode estar se fechando. Horas fazem diferença nos resultados e na recuperação.",
  },
  {
    title: "Perdas de produtividade",
    body: "A detecção tardia significa menor produção de leite, recuperação mais longa, maior custo de tratamento e descartes evitáveis.",
  },
];

export const ProblemSection: React.FC = () => {
  return (
    <section className="relative bg-background py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-forest">
          <span className="h-px w-6 bg-forest/40" />
          O problema
        </div>
        <h2 className="font-display text-4xl leading-[1.02] text-balance sm:text-5xl lg:text-6xl max-w-3xl text-foreground">
          Problemas de saúde no rebanho leiteiro
          <br />
          <span className="italic text-muted-foreground">são detectados tarde demais.</span>
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          A observação manual é limitada. Os primeiros sinais de doença podem ser sutis — variações
          de temperatura, movimento anormal, alterações na frequência cardíaca e na postura aparecem
          antes dos sintomas visíveis.
        </p>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {cards.map((c, i) => (
            <div
              key={c.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:-translate-y-1"
            >
              <div className="mb-10 text-xs font-medium tracking-widest text-forest">0{i + 1}</div>
              <h3 className="font-display text-2xl leading-tight text-foreground">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-16 max-w-2xl font-display text-2xl text-foreground/85 sm:text-3xl">
          Quando cada hora importa,{" "}
          <span className="italic text-forest">o monitoramento contínuo</span> dá às fazendas uma
          vantagem decisiva.
        </p>
      </div>
    </section>
  );
};
