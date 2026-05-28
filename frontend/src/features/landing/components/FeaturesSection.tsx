import React from "react";
import { IcHeartPulse, IcAlertTriangle, IcBarChart } from "@components/icons/LandingIcons";

interface Feature {
  id: string;
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  title: string;
  description: string;
  metadata: string;
  primary?: boolean;
  showVitals?: boolean;
}

interface FeaturesSectionProps {
  showLiveVitals?: boolean;
}

const FEATURES: Feature[] = [
  {
    id: "monitor",
    icon: IcHeartPulse,
    title: "Monitoramento contínuo",
    description: "Frequência cardíaca, temperatura e atividade a cada batida — direto da coleira.",
    metadata: "24/7",
    primary: true,
    showVitals: true,
  },
  {
    id: "alerts",
    icon: IcAlertTriangle,
    title: "Alertas inteligentes",
    description: "Notificação imediata de anomalias, cio e períodos críticos com causa provável.",
    metadata: "< 30s",
  },
  {
    id: "reports",
    icon: IcBarChart,
    title: "Histórico e relatórios",
    description: "Tendências do rebanho e relatórios em PDF para decisões fundamentadas.",
    metadata: "PDF",
  },
];

/**
 * FeaturesSection — Grid of 3 feature cards
 *
 * Features:
 * - Primary card highlighted with accent border
 * - Optional live vitals in the primary card
 * - Icons, titles, descriptions, and metadata
 * - Hover effects with elevation
 */
export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ showLiveVitals = true }) => {
  return (
    <section className="section features">
      <div className="eyebrow">RECURSOS</div>

      <div className="features-head">
        <h2>Cada vaca, cada sinal, todo o tempo.</h2>
      </div>

      <div className="feature-list">
        {FEATURES.map((feature) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            showVitals={feature.showVitals && showLiveVitals}
          />
        ))}
      </div>
    </section>
  );
};

interface FeatureCardProps {
  feature: Feature;
  showVitals?: boolean;
}

/**
 * FeatureCard — Individual feature card with icon, title, description, and optional vitals
 */
const FeatureCard: React.FC<FeatureCardProps> = ({ feature, showVitals }) => {
  const Icon = feature.icon;

  return (
    <article className={`feature-card${feature.primary ? " is-primary" : ""}`}>
      <div className="feature-icon">
        <Icon size={20} color="var(--verdigris)" strokeWidth={1.7} />
      </div>

      <div className="feature-body">
        <h3>{feature.title}</h3>
        <p>{feature.description}</p>

        {showVitals && <MiniVitals />}
      </div>

      <div className="feature-meta">{feature.metadata}</div>
    </article>
  );
};

/**
 * MiniVitals — Live data grid (BPM, Temp, Activity)
 */
const MiniVitals: React.FC = () => {
  const vitals = [
    { label: "BPM", value: "72", unit: "/min" },
    { label: "Temp.", value: "38.6", unit: "°C" },
    { label: "Atividade", value: "94", unit: "%", warn: true },
  ];

  return (
    <div className="mini-vitals">
      {vitals.map((vital) => (
        <div key={vital.label} className="vital">
          <div className="label">{vital.label}</div>
          <div className={`value${vital.warn ? " warn" : ""}`}>
            {vital.value}
            <span className="u"> {vital.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
