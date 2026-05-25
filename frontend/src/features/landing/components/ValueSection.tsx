import React from "react";
import herdImg from "@/assets/landing/herd.jpg";

const cards = [
  {
    t: "Atenção mais precoce",
    b: "Identifique animais que podem precisar de intervenção mais cedo.",
  },
  {
    t: "Mais bem-estar",
    b: "Apoie a observação contínua sem aumentar o manejo.",
  },
  {
    t: "Clareza operacional",
    b: "Priorize a atenção veterinária com base em dados, não em achismos.",
  },
  {
    t: "Menos perdas evitáveis",
    b: "Ajude a fazenda a responder antes que o problema se agrave.",
  },
];

export const ValueSection: React.FC = () => {
  return (
    <section id="welfare" className="relative isolate overflow-hidden py-28 text-cream lg:py-36">
      <div className="absolute inset-0 -z-10">
        <img
          src={herdImg}
          alt=""
          width={1920}
          height={1080}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-forest-deep/85" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-signal">
          <span className="h-px w-6 bg-signal/40" />
          Valor para o negócio
        </div>
        <h2 className="font-display text-4xl leading-[1.02] text-cream text-balance max-w-3xl sm:text-5xl lg:text-6xl">
          Vacas mais saudáveis. Decisões mais rápidas.
          <br />
          <span className="italic text-cream/75">Operações leiteiras mais fortes.</span>
        </h2>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <div
              key={c.t}
              className="relative flex flex-col justify-between rounded-2xl border border-cream/15 bg-cream/5 p-7 backdrop-blur-sm"
            >
              <div className="text-xs tracking-widest text-signal">0{i + 1}</div>
              <div className="mt-16">
                <h3 className="font-display text-2xl text-cream">{c.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/75">{c.b}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
