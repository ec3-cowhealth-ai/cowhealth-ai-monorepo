import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SLIDES = [
  {
    title: "Monitoramento em tempo real",
    subtitle: "Coleiras RF10A enviam dados de FC, temperatura e atividade",
    emoji: "📡",
  },
  {
    title: "Alertas inteligentes",
    subtitle: "Receba notificações quando uma vaca precisar de atenção",
    emoji: "🔔",
  },
  {
    title: "Gerencie seu rebanho",
    subtitle: "Selecione a fazenda e acompanhe cada animal individualmente",
    emoji: "🐄",
  },
];

const finish = (navigate: ReturnType<typeof useNavigate>) => {
  localStorage.setItem("onboardingDone", "true");
  navigate("/dashboard", { replace: true });
};

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (localStorage.getItem("onboardingDone")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const slide = SLIDES[step];

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg-app)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        gap: 32,
        color: "var(--text-primary)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          maxWidth: 360,
          textAlign: "center",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 72, lineHeight: 1 }}>{slide.emoji}</span>
        <h1
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 28,
            fontWeight: 400,
            margin: 0,
          }}
        >
          {slide.title}
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6 }}>
          {slide.subtitle}
        </p>
      </div>

      {/* Dot indicators */}
      <div style={{ display: "flex", gap: 8 }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              width: i === step ? 24 : 8,
              height: 8,
              borderRadius: 999,
              background: i === step ? "var(--pearl-aqua, #339989)" : "var(--border)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "width 0.2s",
            }}
          />
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 360 }}>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (step < SLIDES.length - 1) setStep(step + 1);
            else finish(navigate);
          }}
        >
          {step < SLIDES.length - 1 ? "Próximo" : "Começar"}
        </button>
        {step < SLIDES.length - 1 && (
          <button
            className="btn btn-ghost"
            onClick={() => finish(navigate)}
          >
            Pular
          </button>
        )}
      </div>
    </div>
  );
};
