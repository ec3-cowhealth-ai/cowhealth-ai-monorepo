import React from "react";

/* ── Faux screen data ───────────────────────────────────────────────── */

const ScreenHome: React.FC = () => (
  <div className="ps-screen ps-screen--home">
    <div className="ps-status-bar">
      <span className="ps-time">9:41</span>
      <span className="ps-status-icons">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <rect x="0" y="2" width="2" height="6" rx="0.5" fill="currentColor" opacity="0.4" />
          <rect x="3" y="1" width="2" height="7" rx="0.5" fill="currentColor" opacity="0.6" />
          <rect x="6" y="0" width="2" height="8" rx="0.5" fill="currentColor" />
          <rect
            x="9"
            y="0"
            width="3"
            height="8"
            rx="1"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <rect x="9.5" y="0.5" width="2" height="7" rx="0.6" fill="currentColor" />
        </svg>
      </span>
    </div>

    <div className="ps-greeting">
      <span className="ps-greeting-label">Olá, Maria 👋</span>
      <span className="ps-greeting-date">Seg, 25 Mai</span>
    </div>

    <div className="ps-score-card">
      <div className="ps-score-label">Saúde do Rebanho</div>
      <div className="ps-score-value">
        <span className="ps-score-num">92</span>
        <span className="ps-score-den">/100</span>
      </div>
      <div className="ps-score-bar">
        <div className="ps-score-fill" style={{ width: "92%" }} />
      </div>
      <div className="ps-score-badge">Excelente</div>
    </div>

    <div className="ps-kpi-row">
      <div className="ps-kpi ps-kpi--success">
        <span className="ps-kpi-val">142</span>
        <span className="ps-kpi-lbl">Saudáveis</span>
      </div>
      <div className="ps-kpi ps-kpi--warning">
        <span className="ps-kpi-val">8</span>
        <span className="ps-kpi-lbl">Atenção</span>
      </div>
      <div className="ps-kpi ps-kpi--danger">
        <span className="ps-kpi-val">2</span>
        <span className="ps-kpi-lbl">Crítico</span>
      </div>
    </div>

    <div className="ps-section-label">Ações rápidas</div>
    <div className="ps-actions-row">
      <button className="ps-action-btn">
        <span className="ps-action-icon">📍</span>
        <span>Mapa</span>
      </button>
      <button className="ps-action-btn">
        <span className="ps-action-icon">🔔</span>
        <span>Alertas</span>
      </button>
      <button className="ps-action-btn">
        <span className="ps-action-icon">📋</span>
        <span>Relatório</span>
      </button>
    </div>
  </div>
);

const ScreenAlerts: React.FC = () => (
  <div className="ps-screen ps-screen--alerts">
    <div className="ps-status-bar">
      <span className="ps-time">9:41</span>
    </div>
    <div className="ps-screen-title">Alertas</div>
    <div className="ps-alert-list">
      <div className="ps-alert-card ps-alert-card--danger">
        <div className="ps-alert-icon">🌡️</div>
        <div className="ps-alert-body">
          <div className="ps-alert-title">Febre detectada</div>
          <div className="ps-alert-sub">Vaca #A-041 · 39.8 °C</div>
          <div className="ps-alert-time">há 3 min</div>
        </div>
      </div>
      <div className="ps-alert-card ps-alert-card--warning">
        <div className="ps-alert-icon">💓</div>
        <div className="ps-alert-body">
          <div className="ps-alert-title">FC elevada</div>
          <div className="ps-alert-sub">Vaca #B-017 · 98 bpm</div>
          <div className="ps-alert-time">há 12 min</div>
        </div>
      </div>
      <div className="ps-alert-card ps-alert-card--success">
        <div className="ps-alert-icon">✅</div>
        <div className="ps-alert-body">
          <div className="ps-alert-title">Recuperada</div>
          <div className="ps-alert-sub">Vaca #C-008 · normal</div>
          <div className="ps-alert-time">há 1 h</div>
        </div>
      </div>
      <div className="ps-alert-card ps-alert-card--warning">
        <div className="ps-alert-icon">🏃</div>
        <div className="ps-alert-body">
          <div className="ps-alert-title">Atividade baixa</div>
          <div className="ps-alert-sub">Vaca #A-029 · 12 passos/h</div>
          <div className="ps-alert-time">há 2 h</div>
        </div>
      </div>
    </div>
  </div>
);

const ScreenCowDetail: React.FC = () => (
  <div className="ps-screen ps-screen--detail">
    <div className="ps-status-bar">
      <span className="ps-time">9:41</span>
    </div>
    <div className="ps-cow-header">
      <div className="ps-cow-avatar">🐄</div>
      <div className="ps-cow-info">
        <div className="ps-cow-name">Estrela #A-041</div>
        <div className="ps-cow-meta">Holandesa · 4 anos · 650 kg</div>
      </div>
    </div>
    <div className="ps-risk-card">
      <div className="ps-risk-label">Risco de Saúde</div>
      <div className="ps-risk-arc">
        <svg viewBox="0 0 80 50" width="80" height="50">
          <path
            d="M8 46 A34 34 0 0 1 72 46"
            fill="none"
            stroke="rgba(255,250,251,0.1)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M8 46 A34 34 0 0 1 72 46"
            fill="none"
            stroke="#e87c5c"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="107"
            strokeDashoffset="32"
          />
          <text x="40" y="42" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fffafb">
            70%
          </text>
        </svg>
      </div>
      <div className="ps-risk-badge ps-risk-badge--high">Alto</div>
    </div>
    <div className="ps-vitals-grid">
      <div className="ps-vital-chip">
        <span className="ps-vital-icon">🌡️</span>
        <span className="ps-vital-val ps-vital-val--danger">39.8°C</span>
        <span className="ps-vital-lbl">Temp.</span>
      </div>
      <div className="ps-vital-chip">
        <span className="ps-vital-icon">💓</span>
        <span className="ps-vital-val">78 bpm</span>
        <span className="ps-vital-lbl">FC</span>
      </div>
      <div className="ps-vital-chip">
        <span className="ps-vital-icon">🏃</span>
        <span className="ps-vital-val ps-vital-val--warning">18/h</span>
        <span className="ps-vital-lbl">Ativ.</span>
      </div>
    </div>
    <div className="ps-chart-label">Temperatura — 24h</div>
    <div className="ps-sparkline">
      <svg viewBox="0 0 180 40" preserveAspectRatio="none" width="100%" height="40">
        <defs>
          <linearGradient id="spk-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e87c5c" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#e87c5c" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,28 L20,26 L40,24 L60,22 L80,20 L100,18 L120,14 L140,10 L160,8 L180,6"
          fill="none"
          stroke="#e87c5c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0,28 L20,26 L40,24 L60,22 L80,20 L100,18 L120,14 L140,10 L160,8 L180,6 L180,40 L0,40 Z"
          fill="url(#spk-grad)"
        />
      </svg>
    </div>
  </div>
);

/* ── PhoneMockup ────────────────────────────────────────────────────── */

interface PhoneMockupProps {
  tilt?: "left" | "center" | "right";
  label: string;
  children: React.ReactNode;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({ tilt = "center", label, children }) => (
  <div className={`phone-wrap phone-wrap--${tilt}`}>
    <div className="phone-frame">
      <div className="phone-island" />
      <div className="phone-screen">{children}</div>
      <div className="phone-home-bar" />
    </div>
    <div className="phone-label">{label}</div>
  </div>
);

/* ── AppPreviewSection ──────────────────────────────────────────────── */

export const AppPreviewSection: React.FC = () => (
  <section id="app" className="app-preview-section">
    <div className="app-preview-copy">
      <span className="section-eyebrow">PLATAFORMA</span>
      <h2 className="app-preview-title">Tudo que você precisa,&nbsp;na palma da mão.</h2>
      <p className="app-preview-subtitle">
        Monitore, receba alertas e acompanhe o histórico de cada animal — de qualquer lugar.
      </p>
    </div>

    <div className="phone-stage">
      <PhoneMockup tilt="left" label="Alertas">
        <ScreenAlerts />
      </PhoneMockup>
      <PhoneMockup tilt="center" label="Painel">
        <ScreenHome />
      </PhoneMockup>
      <PhoneMockup tilt="right" label="Animal">
        <ScreenCowDetail />
      </PhoneMockup>
    </div>
  </section>
);
