/**
 * RegisterForm Component
 * TODO[ANGELO]: Implementar com validação Zod + react-hook-form
 *
 * Funcionalidades esperadas:
 * - Campo de email
 * - Campo de full name
 * - Campo de password (com validação de força)
 * - Campo de confirmação de password
 * - Botão de submit com loading state
 * - Validação de senha confirmada
 * - Mensagens de erro/sucesso
 * - Link para página de login
 * - Integração com serviço de registro
 */

export const RegisterForm = () => {
  // TODO[ANGELO]: Implementar hook useRegister() similar a useLogin()
  // const { mutate: register, isPending, isError, error } = useRegister();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO[ANGELO]: Extrair valores com react-hook-form e validar com Zod
    // TODO[ANGELO]: Chamar register(formData) e redirecionar após sucesso
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* TODO[ANGELO]: Adicionar campos de registro com validação Zod */}
      <button type="submit">
        {/* isPending ? 'Registrando...' : 'Registrar' */}
        Registrar
      </button>
    </form>
  );
};