import React from "react";
import heroCowImg from "@/assets/landing/hero-cow.jpg";

interface HeroSectionProps {
  onCtaClick?: () => void;
  onLearnMoreClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCtaClick, onLearnMoreClick }) => {
  return (
    <section id="top" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroCowImg}
          alt="Vaca leiteira usando a coleira inteligente da CowHealth AI"
          width={1920}
          height={1080}
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      <div className="mx-auto flex min-h-svh max-w-7xl flex-col justify-between px-6 pb-16 pt-32 lg:px-10 lg:pt-40">
        {/* Live indicator — top */}
        <div className="flex items-center gap-2 text-cream/85">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
          </span>
          <span className="text-[11px] uppercase tracking-[0.22em]">
            Criado para o monitoramento de saúde de precisão na pecuária leiteira
          </span>
        </div>

        {/* Headline — bottom */}
        <div className="max-w-3xl">
          <h1 className="font-display text-5xl leading-[0.95] text-cream sm:text-7xl lg:text-[5.5rem]">
            Saiba antes.
            <br />
            Aja mais rápido.
            <br />
            <span className="italic text-cream/85">Proteja cada vaca.</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg">
            A CowHealth AI transforma dados fisiológicos e comportamentais em tempo real em alertas
            precoces de risco à saúde para fazendas leiteiras — ajudando produtores e veterinários a
            agir antes que pequenos sinais virem grandes problemas.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              onClick={onCtaClick}
              className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3.5 text-sm font-medium text-graphite shadow-elegant transition-transform hover:-translate-y-0.5"
            >
              Acessar conta
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
            </button>
            <button
              onClick={onLearnMoreClick}
              className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-6 py-3.5 text-sm font-medium text-cream backdrop-blur-sm transition-colors hover:bg-cream/10"
            >
              Veja como funciona
            </button>
          </div>

          <p className="mt-10 text-xs uppercase tracking-[0.22em] text-cream/65">
            Coleira inteligente · Monitoramento em tempo real · Alertas transparentes com IA
          </p>
        </div>
      </div>
    </section>
  );
};
