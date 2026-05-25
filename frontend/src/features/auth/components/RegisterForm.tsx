import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useRegister } from "@hooks/useAuth";

const schema = z
  .object({
    name: z.string().min(2, "Nome obrigatorio (min. 2 caracteres)"),
    email: z.string().email("Email invalido"),
    password: z
      .string()
      .min(8, "Minimo 8 caracteres")
      .regex(/[A-Z]/, "Precisa de pelo menos uma letra maiuscula")
      .regex(/[0-9]/, "Precisa de pelo menos um numero"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas nao conferem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof schema>;

export const RegisterForm = () => {
  const { mutate: register, isPending, isError, error } = useRegister();

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: RegisterFormData) => {
    register({ name: data.name, email: data.email, password: data.password });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}
    >
      <div className="form-field">
        <label className="form-field__label" htmlFor="name">
          Nome completo
        </label>
        <input
          id="name"
          type="text"
          className="form-field__input"
          placeholder="Seu nome"
          {...field("name")}
        />
        {errors.name && <p className="form-field__error">{errors.name.message}</p>}
      </div>

      <div className="form-field">
        <label className="form-field__label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="form-field__input"
          placeholder="seu@email.com"
          {...field("email")}
        />
        {errors.email && <p className="form-field__error">{errors.email.message}</p>}
      </div>

      <div className="form-field">
        <label className="form-field__label" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          type="password"
          className="form-field__input"
          placeholder="••••••••"
          {...field("password")}
        />
        {errors.password && <p className="form-field__error">{errors.password.message}</p>}
      </div>

      <div className="form-field">
        <label className="form-field__label" htmlFor="confirmPassword">
          Confirmar senha
        </label>
        <input
          id="confirmPassword"
          type="password"
          className="form-field__input"
          placeholder="••••••••"
          {...field("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="form-field__error">{errors.confirmPassword.message}</p>
        )}
      </div>

      {isError && (
        <p className="form-field__error" style={{ textAlign: "center" }}>
          {error instanceof Error ? error.message : "Erro ao criar conta."}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary btn-lg"
        style={{ marginTop: "var(--s-2)" }}
      >
        {isPending ? "Criando conta..." : "Criar conta"}
      </button>

      <p
        style={{
          textAlign: "center",
          fontSize: "var(--t-sm)",
          color: "var(--text-secondary)",
        }}
      >
        Ja tem conta?{" "}
        <Link to="/login" style={{ color: "var(--primary)" }}>
          Entrar
        </Link>
      </p>
    </form>
  );
};
