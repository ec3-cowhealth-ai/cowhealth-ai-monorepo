import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useLogin } from '@hooks/useAuth';
import type { LoginFormData } from '../types';

const schema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Minimo 6 caracteres'),
});

export const LoginForm = () => {
  const { mutate: login, isPending, isError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
      <div className="form-field">
        <label className="form-field__label" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className="form-field__input"
          placeholder="seu@email.com"
          autoComplete="one-time-code"
          {...register('email')}
        />
        {errors.email && <p className="form-field__error">{errors.email.message}</p>}
      </div>

      <div className="form-field">
        <label className="form-field__label" htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          className="form-field__input"
          placeholder="••••••••"
          {...register('password')}
        />
        {errors.password && <p className="form-field__error">{errors.password.message}</p>}
      </div>

      {isError && (
        <p className="form-field__error" style={{ textAlign: 'center' }}>
          Email ou senha incorretos.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary btn-lg"
        style={{ marginTop: 'var(--s-2)' }}
      >
        {isPending ? 'Entrando...' : 'Entrar'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 'var(--t-sm)', color: 'var(--text-secondary)' }}>
        Nao tem conta?{' '}
        <Link to="/register" style={{ color: 'var(--primary)' }}>
          Registre-se
        </Link>
      </p>
    </form>
  );
};
