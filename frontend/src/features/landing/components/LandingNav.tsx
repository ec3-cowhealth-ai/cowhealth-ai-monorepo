import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoFull from "@/assets/landing/chai_logo_full.png";

const links = [
  { href: "#product", label: "Produto" },
  { href: "#technology", label: "Tecnologia" },
  { href: "#dashboard", label: "Painel" },
  { href: "#app", label: "Aplicativo" },
  { href: "#welfare", label: "Bem-estar" },
  { href: "#pilot", label: "Piloto" },
];

export const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 backdrop-blur-xl ${
        scrolled ? "bg-background/85 border-b border-border/60" : "bg-background/50"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="#top" className="flex items-center">
          <img src={logoFull} alt="CowHealth AI" className="h-14 w-auto" />
        </a>

        <ul className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`text-sm transition-colors ${
                  scrolled
                    ? "text-foreground/75 hover:text-foreground"
                    : "text-foreground/75 hover:text-foreground"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          onClick={() => navigate("/login")}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
        >
          Acessar conta
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14m-5-5 5 5-5 5" />
          </svg>
        </button>
      </nav>
    </header>
  );
};
