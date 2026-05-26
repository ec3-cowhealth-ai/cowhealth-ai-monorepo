import React from "react";
import { useNavigate } from "react-router-dom";
import dashImg from "@/assets/landing/dashboard.jpg";
import {
  LandingNav,
  HeroSection,
  ProblemSection,
  SolutionSection,
  CollarSection,
  IntelligenceSection,
  AppPreviewSection,
  ValueSection,
  TrustSection,
  PilotSection,
  Footer,
} from "../components";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="bg-background text-foreground overflow-x-hidden">
      <LandingNav />

      <HeroSection
        onCtaClick={() => navigate("/login")}
        onLearnMoreClick={() => {
          document.getElementById("solution")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <ProblemSection />
      <SolutionSection />
      <CollarSection />
      <IntelligenceSection />

      {/* Dashboard screenshot section — id="dashboard" for nav */}
      <section id="dashboard" className="relative overflow-hidden bg-background py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-forest">
            <span className="h-px w-6 bg-forest/40" />
            A plataforma
          </div>
          <h2 className="font-display text-4xl leading-[1.02] text-balance max-w-3xl sm:text-5xl lg:text-6xl text-foreground">
            Um painel
            <br />
            <span className="italic text-forest">para todo o rebanho.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Projetado para produtores, veterinários e gestores de fazenda — a CowHealth AI
            transforma dados brutos de sensores em decisões claras e priorizadas.
          </p>

          <div className="mt-14 overflow-hidden rounded-3xl border border-border bg-card p-2 shadow-elegant sm:p-3">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={dashImg}
                alt="Painel da CowHealth AI"
                width={1920}
                height={1200}
                loading="lazy"
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              "Monitoramento em tempo real",
              "Perfis individuais por vaca",
              "Tendências históricas",
              "Pontuações de risco",
              "Alertas inteligentes",
              "Relatórios e exportações",
              "Acesso multiusuário",
              "Autenticação segura",
            ].map((f) => (
              <div
                key={f}
                className="rounded-xl border border-border bg-card px-4 py-4 text-sm transition-colors hover:border-forest/40 text-foreground"
              >
                <div className="mb-2 h-1 w-6 rounded-full bg-forest/40" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phone mockups — id="app" for nav */}
      <AppPreviewSection />

      <ValueSection />
      <TrustSection />
      <PilotSection onSignUp={() => navigate("/register")} />
      <Footer />
    </main>
  );
};
