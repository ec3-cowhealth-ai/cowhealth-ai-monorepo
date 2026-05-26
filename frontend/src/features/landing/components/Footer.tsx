import React from "react";

const cols = [
  {
    title: "Produto",
    links: ["Coleira Inteligente", "Tecnologia", "Painel", "Bem-estar Animal"],
  },
  {
    title: "Empresa",
    links: ["Sobre", "Piloto", "Contato", "Imprensa"],
  },
  {
    title: "Legal",
    links: ["Privacidade / LGPD", "Termos", "Segurança", "Tratamento de Dados"],
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-graphite text-cream/80">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-forest text-cream">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 12c0-4 3-7 8-7s8 3 8 7-3 7-8 7c-1.5 0-2.5-.3-3.5-.8L4 20l1.2-4.2C4.4 14.8 4 13.5 4 12z" />
                </svg>
              </span>
              <span className="text-base text-cream">CowHealth AI</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/60">
              Inteligência preditiva de saúde para rebanhos leiteiros. Visibilidade contínua,
              alertas transparentes e foco no bem-estar animal.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {cols.map((c) => (
              <div key={c.title}>
                <div className="text-[11px] uppercase tracking-[0.22em] text-cream/45">
                  {c.title}
                </div>
                <ul className="mt-5 space-y-3 text-sm">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-cream/75 transition-colors hover:text-cream">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-cream/10 pt-8 text-xs text-cream/45 sm:flex-row sm:items-center">
          <div>© {new Date().getFullYear()} CowHealth AI. Todos os direitos reservados.</div>
          <div>Projetado para operações leiteiras com bem-estar em primeiro lugar.</div>
        </div>
      </div>
    </footer>
  );
};
