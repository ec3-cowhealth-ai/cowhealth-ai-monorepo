import { useState } from "react";
import { useLogin } from "../../hooks/useAuth";

export const LoginPage = () => {
  const { mutate: login, isPending, error } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    login({ email, password });
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--s-4)",
        background: "var(--bg-app)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "var(--bg-elev-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          padding: "var(--s-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--s-4)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--t-h1)",
              fontWeight: 700,
              margin: 0,
              color: "var(--text-primary)",
            }}
          >
            CowHealth AI
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--s-4)",
          }}
        >
          <div className="form-field">
            <label className="form-field__label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="form-field__input"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="form-field__input"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p
              className="form-field__error"
              style={{ textAlign: "center", marginTop: "var(--s-2)" }}
            >
              Email ou senha incorretos.
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary btn-lg"
            style={{ marginTop: "var(--s-2)" }}
          >
            {isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};
