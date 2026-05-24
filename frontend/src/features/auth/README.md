# Auth Feature

**Responsável:** Angelo

## 📋 Tarefas

### ✅ Implementado

- Estrutura de pastas criada
- Tipos básicos definidos
- Componentes esqueleto criados

### 🚀 TODO

#### 1. LoginForm Component

**Arquivo:** `components/LoginForm.tsx`

- [ ] Implementar formulário com `react-hook-form`
- [ ] Adicionar validação com `Zod`:
  - Email válido
  - Password obrigatório (mín 6 caracteres)
- [ ] Integrar com `useLogin()` hook
- [ ] Adicionar handling de erros (email/password inválidos)
- [ ] Estilizar com design system (Tailwind CSS)
- [ ] Adicionar link para `/register`
- [ ] Loading state durante envio

#### 2. RegisterForm Component

**Arquivo:** `components/RegisterForm.tsx`

- [ ] Implementar formulário com `react-hook-form` + `Zod`
- [ ] Validações:
  - Full name obrigatório
  - Email válido e único
  - Password (mín 8 caracteres, deve incluir maiúscula + número)
  - Confirmação de password igual ao password
- [ ] Criar hook `useRegister()` em `@hooks/useAuth.ts`
- [ ] Implementar endpoint POST `/auth/register` no backend (ou solicitar a Renato)
- [ ] Adicionar handling de erros (email já existe, etc)
- [ ] Link para `/login` após registro bem-sucedido
- [ ] Validações de força de senha visual

#### 3. Hooks

**Arquivo:** `@hooks/useAuth.ts`

- [ ] Validar `useLogin()` — já existe
- [ ] Criar `useRegister()` (similar a useLogin)
- [ ] Validar `useLogout()` — já existe
- [ ] Validar `useMe()` — já existe

#### 4. Services

**Considerar criar:** `features/auth/services/authService.ts`

- [ ] Mover ou criar `registerService()` se não existir

#### 5. Tipos

**Arquivo:** `types/index.ts`

- [ ] Expandir com tipos de erro
- [ ] Adicionar tipos de resposta do servidor

#### 6. Testes (Opcional)

- [ ] Testes unitários para validação de formulário
- [ ] Teste de submissão com sucesso/erro

## 🔗 Links Úteis

- **Global useAuth:** `frontend/src/hooks/useAuth.ts`
- **Global authService:** `frontend/src/services/authService.ts`
- **AppRoutes:** `frontend/src/routes/AppRoutes.tsx`
- **Design System:** `frontend/src/styles/app.css`
- **Exemplo de Feature:** `frontend/src/features/farms/`

## 📦 Dependências Necessárias

```bash
npm install react-hook-form @hookform/resolvers zod
```

## 🎨 Design Reference

- Página de login: `frontend/src/pages/auth/LoginPage.tsx`
- Componentes reutilizáveis: `frontend/src/components/common/`

## 💡 Próximos Passos

1. Implementar LoginForm (backend já funcional)
2. Implementar RegisterForm (coordenar com Renato no backend)
3. Atualizar páginas em `frontend/src/pages/auth/`
4. Testar fluxo: registro → login → /home
