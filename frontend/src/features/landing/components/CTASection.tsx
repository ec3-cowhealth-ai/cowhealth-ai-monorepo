import React from "react";
import { IcArrowRight, IcCheck } from "@components/icons/LandingIcons";

interface CTASectionProps {
  onSignUp?: () => void;
  onScheduleDemo?: () => void;
  showTrustRow?: boolean;
}

/**
 * CTASection — Call-to-action card with messaging and buttons
 *
 * Features:
 * - Primary and secondary CTA buttons
 * - Optional trust/credibility row (SEM CARTÃO · LGPD · OFFLINE)
 * - Eyebrow label
 * - Dark theme, high contrast
 */
export const CTASection: React.FC<CTASectionProps> = ({
  onSignUp,
  onScheduleDemo,
  showTrustRow = true,
}) => {
  return (
    <section className="section">
      <div className="cta-card">
        <div className="cta-eyebrow">COMECE EM 3 MINUTOS</div>

        <h2>
          Do primeiro animal à
          <br />
          gestão do rebanho inteiro.
        </h2>

        <p>
          Crie sua conta gratuitamente, conecte uma coleira e veja os dados
          chegarem. Sem cartão, sem fidelidade.
        </p>

        <div className="cta-stack">
          <button className="btn btn-primary" type="button" onClick={onSignUp}>
            Criar conta grátis
            <span className="ic">
              <IcArrowRight size={18} strokeWidth={2} />
            </span>
          </button>

          <button
            className="btn btn-secondary"
            type="button"
            onClick={onScheduleDemo}
          >
            Agendar demonstração
          </button>
        </div>

        {showTrustRow && <TrustRow />}
      </div>
    </section>
  );
};

/**
 * TrustRow — Credibility indicators
 */
const TrustRow: React.FC = () => {
  const items = ["SEM CARTÃO", "LGPD", "OFFLINE"];

  return (
    <div className="trust-row">
      {items.map((item, index) => (
        <React.Fragment key={item}>
          {index > 0 && <span className="sep">·</span>}
          {index === 0 ? (
            <>
              <IcCheck size={11} strokeWidth={2.4} style={{ marginRight: 4 }} />
              <span>{item}</span>
            </>
          ) : (
            <span>{item}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
