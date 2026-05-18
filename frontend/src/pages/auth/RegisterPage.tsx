import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { registerService } from "../../services/authService";
import type { RegisterInput } from "../../types/auth";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
    profile: "VIEWER",
  });

  const { mutate: register, isPending, error } = useMutation({
    mutationFn: registerService,
    onSuccess: () => {
      navigate("/users");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    register(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-onyx text-snow p-6 font-body">
      <div className="w-full max-w-[340px] flex flex-col gap-10">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-snow">
            Novo Colaborador
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Acesso administrativo para cadastro de usuários.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1" htmlFor="name">
              Nome Completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="João Silva"
              value={formData.name}
              onChange={handleChange}
              className="h-[48px] w-full bg-graphite border-none rounded-xl px-4 text-sm text-snow placeholder:text-gray-600 focus:ring-2 focus:ring-verdigris/50 transition-all outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="email@email.com"
              value={formData.email}
              onChange={handleChange}
              className="h-[48px] w-full bg-graphite border-none rounded-xl px-4 text-sm text-snow placeholder:text-gray-600 focus:ring-2 focus:ring-verdigris/50 transition-all outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="h-[48px] w-full bg-graphite border-none rounded-xl px-4 text-sm text-snow placeholder:text-gray-600 focus:ring-2 focus:ring-verdigris/50 transition-all outline-none"
              required
              minLength={6}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1" htmlFor="profile">
              Perfil de Acesso
            </label>
            <select
              id="profile"
              name="profile"
              value={formData.profile}
              onChange={handleChange}
              className="h-[48px] w-full bg-graphite border-none rounded-xl px-4 text-sm text-snow focus:ring-2 focus:ring-verdigris/50 transition-all outline-none appearance-none cursor-pointer"
              required
            >
              <option value="VET">Veterinário</option>
              <option value="MANAGER">Gestor</option>
              <option value="ADMIN">Administrador</option>
              <option value="SUPER-ADMIN">Super Administrador</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center">
              Falha ao registrar. Verifique os dados.
            </div>
          )}

          <div className="flex flex-col gap-3 mt-4">
            <button
                type="submit"
                disabled={isPending}
                className="h-[48px] w-full bg-verdigris hover:bg-pearl-aqua text-onyx font-bold rounded-xl shadow-lg shadow-verdigris/10 transition-all active:scale-[0.98] disabled:opacity-50"
            >
                {isPending ? "Registrando..." : "Cadastrar Usuário"}
            </button>
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="h-[48px] w-full bg-transparent border border-graphite hover:bg-graphite text-gray-400 font-bold rounded-xl transition-all"
            >
                Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
