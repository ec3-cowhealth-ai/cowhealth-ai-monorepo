import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CowHead } from "@components/ui/CowHeadIcon";
import { C } from "@features/dashboard/constants/colors";

const SLIDES = [
  {
    title: "Monitoramento em tempo real",
    subtitle: "Coleiras RF10A enviam dados de FC, temperatura e atividade para o sistema",
    icon: <CowHead size={64} color={C.green} />,
  },
  {
    title: "Alertas inteligentes",
    subtitle: "Receba notificações quando uma vaca precisar de atenção imediata",
    icon: (
      <div
        style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "var(--status-warning-bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32,
        }}
      >
        🔔
      </div>
    ),
  },
  {
    title: "Gerencie seu rebanho",
    subtitle: "Selecione a fazenda e acompanhe cada animal individualmente",
    icon: (
      <div
        style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "var(--status-success-bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32,
        }}
      >
        🌿
      </div>
    ),
  },
] as const;

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (localStorage.getItem("onboardingDone")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const finish = () => {
    localStorage.setItem("onboardingDone", "true");
    navigate("/dashboard", { replace: true });
  };

  const isLast = current === SLIDES.length - 1;
  const slide  = SLIDES[current];

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "48px 32px 40px",
      }}
    >
      {/* Skip */}
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={finish}
          style={{
            background: "none",
            border: "none",
            fontSize: 14,
            color: C.muted,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Pular
        </button>
      </div>

      {/* Slide content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          textAlign: "center",
          maxWidth: 320,
        }}
      >
        <div>{slide.icon}</div>
        <h1
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 30,
            fontWeight: 400,
            color: C.text,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {slide.title}
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: C.muted, lineHeight: 1.6 }}>
          {slide.subtitle}
        </p>
      </div>

      {/* Bottom: dots + button */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* Dots */}
        <div style={{ display: "flex", gap: 8 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 20 : 8,
                height: 8,
                borderRadius: 999,
                background: i === current ? C.green : C.border,
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width 0.2s ease, background 0.2s ease",
              }}
            />
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={isLast ? finish : () => setCurrent((c) => c + 1)}
          style={{
            width: "100%",
            padding: "14px 24px",
            borderRadius: 12,
            background: C.green,
            border: "none",
            color: "#ffffff",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {isLast ? "Começar" : "Próximo"}
        </button>
      </div>
    </div>
  );
};
