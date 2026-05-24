import React from "react";

interface FooterProps {
  onNavClick?: (link: string) => void;
}

/**
 * Landing Footer — Institutional links and copyright
 *
 * Features:
 * - Brand with dot indicator
 * - Version number
 * - Navigation links (Sobre, Privacidade, Contato, Suporte)
 * - Copyright and disclaimer
 */
export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  const navLinks = [
    { href: "#about", label: "Sobre" },
    { href: "#privacy", label: "Privacidade" },
    { href: "#contact", label: "Contato" },
    { href: "#support", label: "Suporte" },
  ];

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="dot" />
          CowHealth AI
        </div>
        <span className="footer-version">v1.0</span>
      </div>

      <nav className="footer-links" aria-label="Links institucionais">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => {
              e.preventDefault();
              onNavClick?.(link.href);
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="footer-copy">
        © 2026 CowHealth AI
        <br />
        <span className="footer-version">
          Desenvolvido para produtores rurais.
        </span>
      </div>
    </footer>
  );
};
