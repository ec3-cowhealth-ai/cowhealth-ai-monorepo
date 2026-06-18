import { useEffect, useState } from "react";

export const SplashPage = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-app, #131515)",
        gap: 20,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "var(--primary-soft, rgba(0,200,160,0.15))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="16" stroke="var(--verdigris, #00c8a0)" strokeWidth="2.5" />
          <path
            d="M11 20 C13 14, 17 14, 18 18 C19 22, 23 22, 25 16"
            stroke="var(--verdigris, #00c8a0)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
      <p
        style={{
          color: "var(--text-secondary, #8a9ba8)",
          fontSize: 13,
          margin: 0,
          animation: "splashFade 1.2s ease-in-out infinite alternate",
        }}
      >
        Sincronizando coleiras…
      </p>
      <style>{`
        @keyframes splashFade {
          from { opacity: 0.4; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
