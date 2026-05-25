import React from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection, FeaturesSection, CTASection, Footer } from "../components";
import { IcBroadcast } from "@components/icons/LandingIcons";

/**
 * LandingPage — Public landing page for CowHealth AI
 *
 * Sections:
 * 1. Brand strip (sticky header with logo and beta badge)
 * 2. Hero (title, subtitle, visual, CTAs)
 * 3. Features (3 cards: monitor, alerts, reports)
 * 4. CTA (sign up, schedule demo, trust row)
 * 5. Footer (links, copyright)
 *
 * Notes:
 * - Does not require authentication
 * - Fully responsive (mobile-first)
 * - Dark theme with high contrast (WCAG AA)
 * - Uses design system from agents/design.md
 */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  const handleScheduleDemo = () => {
    // TODO: Implement demo scheduling modal or redirect
    console.log("Schedule demo");
  };

  const handleNavLink = (link: string) => {
    // TODO: Implement footer link navigation
    console.log("Navigate to:", link);
  };

  return (
    <div className="stage">
      <div className="app">
        {/* Brand strip */}
        <div className="brand-strip">
          <div className="brand">
            <span className="brand-mark">
              <IcBroadcast size={14} strokeWidth={2} />
            </span>
            CowHealth AI
          </div>
          <span className="status-pill">
            <span className="pulse-dot" />
            BETA
          </span>
        </div>

        {/* Main sections */}
        <HeroSection
          onCtaClick={handleSignIn}
          onLearnMoreClick={() => {
            // TODO: Scroll to features or play video
            console.log("Learn more");
          }}
        />

        <FeaturesSection showLiveVitals={true} />

        <CTASection
          onSignUp={handleSignUp}
          onScheduleDemo={handleScheduleDemo}
          showTrustRow={true}
        />

        <Footer onNavClick={handleNavLink} />
      </div>
    </div>
  );
};
