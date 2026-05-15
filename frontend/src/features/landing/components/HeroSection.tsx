import React from 'react';
import {
  IcBroadcast,
  IcHeartPulse,
  IcThermometer,
  IcActivity,
  IcAlertTriangle,
  IcArrowRight,
  IcPlay,
} from '@components/icons/LandingIcons';

interface HeroSectionProps {
  onCtaClick?: () => void;
  onLearnMoreClick?: () => void;
  visualKind?: 'collar' | 'cow' | 'dashboard';
}

/**
 * HeroSection — Landing page hero with title, subtitle, visual, and CTAs
 *
 * Features:
 * - Responsive layout (mobile-first)
 * - 3 visual variants: collar (with ECG wave), cow, dashboard
 * - Animated collar visual with floating vitals
 * - Two CTA buttons (primary + ghost)
 * - Dark theme, high contrast (WCAG AA)
 * - Accent word color toggle (verdigris or pearl-aqua)
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  onCtaClick,
  onLearnMoreClick,
  visualKind = 'collar',
}) => {
  return (
    <section className="section hero">
      <div className="eyebrow">PLATAFORMA DE PECUÁRIA INTELIGENTE</div>

      <h1 className="hero-title">
        Monitore a saúde do{' '}
        <span className="accent">seu rebanho</span> em tempo real
      </h1>

      <p className="hero-sub">
        Sensores de coleira inteligente entregam dados precisos — batimento,
        temperatura e atividade — a cada segundo. Para que você decida com
        confiança no campo.
      </p>

      {/* Hero Visual — Multiple variants */}
      <HeroVisual kind={visualKind} />

      {/* CTAs */}
      <div className="cta-stack">
        <button
          className="btn btn-primary"
          type="button"
          onClick={onCtaClick}
        >
          Entrar na minha conta
          <span className="ic">
            <IcArrowRight size={18} strokeWidth={2} />
          </span>
        </button>

        <button
          className="btn btn-ghost"
          type="button"
          onClick={onLearnMoreClick}
        >
          <span className="ic">
            <IcPlay size={14} />
          </span>
          Ver como funciona
        </button>
      </div>
    </section>
  );
};

/**
 * HeroVisual — Three variants: collar (animated, with ECG wave), cow (silhouette), dashboard (mini preview)
 */
interface HeroVisualProps {
  kind: 'collar' | 'cow' | 'dashboard';
}

const HeroVisual: React.FC<HeroVisualProps> = ({ kind }) => {
  if (kind === 'cow') return <HeroVisualCow />;
  if (kind === 'dashboard') return <HeroVisualDashboard />;
  return <HeroVisualCollar />;
};

/**
 * HeroVisualCollar — Main variant: animated collar puck, concentric rings, floating vitals, ECG wave
 */
const HeroVisualCollar: React.FC = () => {
  return (
    <div className="hero-viz">
      <div className="hero-viz-grid" />

      <div className="collar-stage">
        {/* Concentric pulse rings */}
        <span className="ring r1" />
        <span className="ring r2" />
        <span className="ring r3" />

        {/* Collar puck (center) */}
        <div className="collar-puck">
          <IcBroadcast size={42} color="#FFFAFB" strokeWidth={1.5} />
        </div>

        {/* Floating vital chips */}
        <div className="chip-float chip-bpm">
          <span className="ic">
            <IcHeartPulse size={12} />
          </span>
          <span className="val">72</span>
          <span className="lbl">bpm</span>
        </div>

        <div className="chip-float chip-temp">
          <span className="ic">
            <IcThermometer size={12} />
          </span>
          <span className="val">38.6</span>
          <span className="lbl">°C</span>
        </div>

        <div className="chip-float chip-act">
          <span className="ic">
            <IcActivity size={12} />
          </span>
          <span className="val">94</span>
          <span className="lbl">%</span>
        </div>

        <div className="chip-float chip-rum">
          <span className="ic warn">
            <IcAlertTriangle size={12} />
          </span>
          <span className="val">2</span>
          <span className="lbl">alertas</span>
        </div>
      </div>

      {/* ECG-like waveform with Pearl Aqua gradient */}
      <svg
        viewBox="0 0 360 40"
        preserveAspectRatio="none"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: 36,
          marginTop: -8,
          display: 'block',
        }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ecgGrad" x1="0" x2="1">
            <stop offset="0" stopColor="#7DE2D1" stopOpacity="0" />
            <stop offset="0.2" stopColor="#7DE2D1" stopOpacity="1" />
            <stop offset="0.8" stopColor="#7DE2D1" stopOpacity="1" />
            <stop offset="1" stopColor="#7DE2D1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 20 L40 20 L60 20 L70 14 L80 26 L92 4 L104 36 L116 14 L128 20 L180 20 L200 20 L210 12 L222 28 L232 20 L360 20"
          fill="none"
          stroke="url(#ecgGrad)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

/**
 * HeroVisualCow — Alternative variant: stylized cow silhouette with collar
 */
const HeroVisualCow: React.FC = () => {
  return (
    <div className="hero-viz" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <div className="hero-viz-grid" />

      <div className="collar-stage" style={{ height: 230 }}>
        {/* Stylized cow silhouette */}
        <svg
          width="220"
          height="180"
          viewBox="0 0 220 180"
          style={{ position: 'relative', zIndex: 2 }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="cowG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2B2C28" />
              <stop offset="1" stopColor="#131515" />
            </linearGradient>
          </defs>
          {/* Body */}
          <path
            d="M30 110 Q30 70 75 70 L150 70 Q180 70 190 92 Q198 110 188 122 L188 152 Q188 158 182 158 L168 158 Q162 158 162 152 L162 140 L78 140 L78 152 Q78 158 72 158 L58 158 Q52 158 52 152 L52 134 Q34 128 30 110 Z"
            fill="url(#cowG)"
            stroke="#7DE2D1"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Head */}
          <path
            d="M28 96 Q12 92 12 80 Q12 66 28 60 Q36 56 46 60 L60 70"
            fill="#1B1D1D"
            stroke="#7DE2D1"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Ear */}
          <path
            d="M24 64 Q18 56 22 50"
            fill="none"
            stroke="#7DE2D1"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Eye */}
          <circle cx="22" cy="78" r="1.6" fill="#7DE2D1" />
          {/* Spots */}
          <path
            d="M90 88 Q108 84 118 96 Q120 110 102 108 Q86 104 90 88 Z"
            fill="#339989"
            opacity="0.55"
          />
          <path
            d="M150 100 Q166 96 170 110 Q168 122 154 118 Q142 112 150 100 Z"
            fill="#339989"
            opacity="0.4"
          />
          {/* Collar */}
          <path
            d="M52 88 Q70 100 92 100"
            fill="none"
            stroke="#339989"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="68" cy="98" r="6" fill="#339989" stroke="#7DE2D1" strokeWidth="1.4" />
          <circle cx="68" cy="98" r="2.2" fill="#7DE2D1" />
        </svg>

        {/* Pulse rings for cow visual */}
        <span
          className="ring r1"
          style={{ width: 130, height: 130, left: 'calc(50% - 85px)', top: '20px' }}
        />
        <span
          className="ring r2"
          style={{ width: 130, height: 130, left: 'calc(50% - 85px)', top: '20px' }}
        />

        {/* Floating vitals */}
        <div className="chip-float chip-bpm">
          <span className="ic">
            <IcHeartPulse size={12} />
          </span>
          <span className="val">72</span>
          <span className="lbl">bpm</span>
        </div>

        <div className="chip-float chip-temp">
          <span className="ic">
            <IcThermometer size={12} />
          </span>
          <span className="val">38.6</span>
          <span className="lbl">°C</span>
        </div>
      </div>
    </div>
  );
};

/**
 * HeroVisualDashboard — Alternative variant: mini dashboard preview with faux data
 */
const HeroVisualDashboard: React.FC = () => {
  return (
    <div className="hero-viz" style={{ padding: '24px 16px' }}>
      <div className="hero-viz-grid" />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Mini dashboard card */}
        <div
          style={{
            background: 'rgba(11,13,13,0.55)',
            border: '1px solid rgba(255, 250, 251, 0.12)',
            borderRadius: 12,
            padding: 14,
            boxShadow: '0 14px 30px rgba(0,0,0,0.45)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.16em',
                color: 'rgba(255, 250, 251, 0.42)',
                textTransform: 'uppercase',
              }}
            >
              Rebanho · 234 cab.
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: '#7DE2D1' }}>
              <span className="pulse-dot" />
              AO VIVO
            </span>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              { label: 'Saudáveis', value: '218', color: '#7DE2D1' },
              { label: 'Atenção', value: '14', color: '#E8C66B' },
              { label: 'Crítico', value: '2', color: '#E87C5C' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  border: '1px solid rgba(255, 250, 251, 0.06)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    color: 'rgba(255, 250, 251, 0.42)',
                    textTransform: 'uppercase',
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    fontWeight: 700,
                    color: stat.color,
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Mini chart */}
          <svg
            viewBox="0 0 280 60"
            preserveAspectRatio="none"
            style={{ width: '100%', height: 50, marginTop: 12, display: 'block' }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#339989" stopOpacity="0.45" />
                <stop offset="1" stopColor="#339989" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 40 L20 36 L40 38 L60 30 L80 28 L100 24 L120 32 L140 22 L160 20 L180 28 L200 18 L220 22 L240 14 L260 18 L280 12 L280 60 L0 60 Z"
              fill="url(#areaG)"
            />
            <path
              d="M0 40 L20 36 L40 38 L60 30 L80 28 L100 24 L120 32 L140 22 L160 20 L180 28 L200 18 L220 22 L240 14 L260 18 L280 12"
              stroke="#339989"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
