import React from "react";
import collarImg from "@/assets/landing/collar.jpg";

const features = [
  "Monitoramento de temperatura por infravermelho",
  "Captura de sinal de frequência cardíaca",
  "Rastreamento de atividade e postura",
  "Processamento na borda (edge)",
  "Transmissão via Wi-Fi / MQTT",
  "Arquitetura tolerante a falhas de conexão",
  "Projetada para o conforto do animal",
  "Invólucro testado em campo",
];

export const CollarSection: React.FC = () => {
  return (
    <section id="product" className="relative bg-background py-28 lg:py-36">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl bg-muted shadow-elegant">
            <img
              src={collarImg}
              alt="Detalhe da coleira inteligente CowHealth AI"
              width={1600}
              height={1280}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 left-6 rounded-xl border border-border bg-card px-5 py-3 shadow-soft">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Status
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
              <span className="h-2 w-2 rounded-full bg-signal" />
              Transmitindo · 36,8°C
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-forest">
            <span className="h-px w-6 bg-forest/40" />
            A coleira inteligente
          </div>
          <h2 className="font-display text-4xl leading-[1.02] text-balance max-w-3xl sm:text-5xl text-foreground">
            Projetada para
            <br />
            <span className="italic text-forest">condições reais de fazenda.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Uma coleira robusta e confortável, equipada com sensores integrados que monitoram sinais
            fisiológicos e comportamentais essenciais — sem perturbar a rotina do animal.
          </p>

          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-foreground/85">
                <svg
                  viewBox="0 0 24 24"
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-forest"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          <p className="mt-10 border-l-2 border-forest/40 pl-4 text-sm italic text-muted-foreground">
            Construída para apoiar a pecuária de precisão com bem-estar animal em primeiro lugar.
          </p>
        </div>
      </div>
    </section>
  );
};
