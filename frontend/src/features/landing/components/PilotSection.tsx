import React, { useState } from "react";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Obrigatório").max(100),
  company: z.string().trim().min(1, "Obrigatório").max(120),
  email: z.string().trim().email("E-mail inválido").max(200),
  herd: z.string().trim().max(40).optional(),
  role: z.string().trim().max(80).optional(),
  message: z.string().trim().max(1000).optional(),
});

interface PilotSectionProps {
  onSignUp?: () => void;
}

export const PilotSection: React.FC<PilotSectionProps> = ({ onSignUp }) => {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = schema.safeParse(data);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSent(true);
  };

  return (
    <section
      id="pilot"
      className="relative isolate overflow-hidden bg-gradient-forest py-28 text-cream lg:py-36"
    >
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:px-10">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-signal">
            <span className="h-px w-6 bg-signal/40" />
            Programa piloto
          </div>
          <h2 className="font-display text-4xl leading-[1.02] text-cream text-balance max-w-2xl sm:text-5xl">
            Leve o monitoramento
            <br />
            preditivo de saúde
            <br />
            <span className="italic text-cream/75">para o seu rebanho.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/75">
            A CowHealth AI foi feita para operações leiteiras prontas para sair de um cuidado
            reativo e adotar uma inteligência contínua e orientada por dados.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <span className="rounded-full border border-cream/20 px-4 py-2 text-xs text-cream/85">
              Implantação piloto
            </span>
            <span className="rounded-full border border-cream/20 px-4 py-2 text-xs text-cream/85">
              Onboarding veterinário
            </span>
            <span className="rounded-full border border-cream/20 px-4 py-2 text-xs text-cream/85">
              Suporte dedicado
            </span>
          </div>
          {onSignUp && (
            <button
              onClick={onSignUp}
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-cream px-6 py-3.5 text-sm font-medium text-graphite transition-transform hover:-translate-y-0.5"
            >
              Acessar conta
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
            </button>
          )}
        </div>

        <div className="rounded-3xl border border-cream/15 bg-cream p-8 text-foreground shadow-elegant lg:p-10">
          {sent ? (
            <div className="grid h-full place-items-center py-16 text-center">
              <div>
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-forest text-cream">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                </div>
                <h3 className="mt-5 font-display text-2xl text-foreground">Solicitação recebida</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Nossa equipe entrará em contato em até dois dias úteis.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <PilotField label="Nome" name="name" error={errors.name} />
              <PilotField label="Empresa / Fazenda" name="company" error={errors.company} />
              <PilotField label="E-mail" name="email" type="email" error={errors.email} />
              <PilotField label="Tamanho do rebanho" name="herd" placeholder="ex.: 250 vacas" />
              <div className="sm:col-span-2">
                <PilotField
                  label="Função"
                  name="role"
                  placeholder="Produtor · Veterinário · Gestor"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Mensagem
                </label>
                <textarea
                  name="message"
                  rows={3}
                  maxLength={1000}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-forest"
                />
              </div>
              <button
                type="submit"
                className="sm:col-span-2 mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Solicitar um Piloto
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14m-5-5 5 5-5 5" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

function PilotField({
  label,
  name,
  type = "text",
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        maxLength={200}
        className={`mt-2 w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-forest ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
