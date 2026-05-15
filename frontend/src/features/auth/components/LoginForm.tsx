/**
 * LoginForm Component
 * TODO[ANGELO]: Implementar com validação Zod + react-hook-form
 *
 * Funcionalidades esperadas:
 * - Campo de email (com validação)
 * - Campo de password (com validação)
 * - Botão de submit com loading state
 * - Mensagens de erro
 * - Link para página de registro
 * - Integração com useLogin hook
 */

import { useLogin } from '@hooks/useAuth';
import type { LoginFormData } from '../types';

export const LoginForm = () => {
  const { mutate: login, isPending, isError, error } = useLogin();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO[ANGELO]: Extrair valores do formulário com react-hook-form
    const formData: LoginFormData = {
      email: '',
      password: '',
    };
    login(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* TODO[ANGELO]: Adicionar campos com validação Zod */}
      {isError && <div className="error">{(error as any)?.message}</div>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
};