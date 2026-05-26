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
    <div className="min-h-screen flex flex-col items-center justify-center bg-onyx text-snow p-6 font-body">
      <div className="w-full max-w-[340px] flex flex-col gap-12">
        {/* Header/Logo Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-verdigris rounded-2xl flex items-center justify-center shadow-lg shadow-verdigris/20">
            <span className="text-onyx font-display text-3xl font-bold">C</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-display font-bold tracking-tight">
              CowHealth<span className="text-verdigris">AI</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Bem-vindo!
            </p>
            <p className="text-xs text-gray-500">
              Entre para acompanhar o rebanho.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1" htmlFor="email">
              Usuário ou E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="email@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-[48px] w-full bg-graphite border-none rounded-xl px-4 text-sm text-snow placeholder:text-gray-600 focus:ring-2 focus:ring-verdigris/50 transition-all outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold" htmlFor="password">
                Senha
              </label>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-[48px] w-full bg-graphite border-none rounded-xl px-4 text-sm text-snow placeholder:text-gray-600 focus:ring-2 focus:ring-verdigris/50 transition-all outline-none"
              required
            />
            <div className="flex justify-between items-center mt-1 px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-none bg-graphite text-verdigris focus:ring-0 focus:ring-offset-0" />
                    <span className="text-xs text-gray-400 group-hover:text-snow transition-colors">Manter conectado</span>
                </label>
                <a href="#" className="text-xs text-verdigris hover:text-pearl-aqua transition-colors font-medium">
                    Esqueci a senha
                </a>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center">
              E-mail ou senha incorretos. Tente novamente.
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="h-[48px] w-full bg-verdigris hover:bg-pearl-aqua text-onyx font-bold rounded-xl shadow-lg shadow-verdigris/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isPending ? "Sincronizando..." : "Entrar"}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-medium">
            Conexão criptografada · TLS 1.3
          </p>
        </div>
      </div>
    </div>
  );
};
