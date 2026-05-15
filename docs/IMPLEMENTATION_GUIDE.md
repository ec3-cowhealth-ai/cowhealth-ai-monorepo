# 🚀 Guia de Implementação — Features CowHealth

**Data:** 2026-05-15 PM
**Status:** Estrutura pronta para colaboradores

---

## 📊 Matriz de Responsabilidades

| Pessoa | Feature | Status | READMEs |
|--------|---------|--------|---------|
| **Angelo** | `features/auth/` (Login + Register) | 🔴 TODO | ✅ `features/auth/README.md` |
| **Ian** | `features/dashboard/` (Dashboard + Gráficos) | 🔴 TODO | ✅ `features/dashboard/README.md` |
| **Jafte** | Farms, Cows, Collars, Notifications, Access | ✅ DONE | ✅ Implementadas |
| **Renato** | Backend | 🟡 Em andamento | N/A |

---

## 📁 Estrutura Criada

### ✅ Auth Feature (para Angelo)

```
frontend/src/features/auth/
├── README.md                     ← Tarefas específicas
├── index.ts                      ← Exports
├── types/
│   └── index.ts                 ← LoginFormData, RegisterFormData
├── components/
│   ├── LoginForm.tsx            ← TODO[ANGELO]: Implementar
│   └── RegisterForm.tsx         ← TODO[ANGELO]: Implementar
└── (opcional) services/         ← Para dados específicos da auth
```

### ✅ Dashboard Feature (para Ian)

```
frontend/src/features/dashboard/
├── README.md                     ← Tarefas específicas
├── index.ts                      ← Exports
├── types/
│   └── index.ts                 ← DashboardData, ChartDataPoint
├── components/
│   ├── DashboardKPICard.tsx     ← TODO[IAN]: Implementar
│   ├── DashboardOverviewChart.tsx ← TODO[IAN]: Implementar
│   ├── CowsPerStatusChart.tsx   ← TODO[IAN]: Implementar
│   └── CowsPerFarmChart.tsx     ← TODO[IAN]: Implementar
└── pages/
    └── DashboardPage.tsx         ← TODO[IAN]: Integrar componentes
```

### ✅ Jafte Features (Já Implementadas)

```
frontend/src/features/
├── farms/          ✅
├── cows/           ✅
├── collars/        ✅
├── notifications/  ✅
├── access/         ✅
└── landing/        ✅
```

---

## 🎯 Fluxo de Trabalho (Para Cada Colaborador)

### 1️⃣ Angelo — Auth Feature

**Objetivo:** Implementar formulários de login e registro

#### Checklist de Tarefas

```
[ ] Ler docs/FRONTEND_ALIGNMENT_SUMMARY.md (context do projeto)
[ ] Ler frontend/src/features/auth/README.md (tarefas específicas)
[ ] Implementar LoginForm.tsx com react-hook-form + Zod
[ ] Implementar RegisterForm.tsx com react-hook-form + Zod
[ ] Criar hook useRegister() em hooks/useAuth.ts (se necessário)
[ ] Testar fluxo: cadastro → login → /home
[ ] Coordenar com Renato se endpoint /auth/register ainda não existe
```

#### Arquivos a Trabalhar

- `frontend/src/features/auth/components/LoginForm.tsx`
- `frontend/src/features/auth/components/RegisterForm.tsx`
- `frontend/src/features/auth/types/index.ts` (tipos)
- `frontend/src/pages/auth/LoginPage.tsx` (usar LoginForm)
- `frontend/src/pages/auth/RegisterPage.tsx` (criar e usar RegisterForm)
- `frontend/src/hooks/useAuth.ts` (adicionar useRegister se necessário)

#### Dependências Necessárias

```bash
npm install react-hook-form @hookform/resolvers zod
```

#### Referências

- Exemplo de feature: `frontend/src/features/farms/`
- Hook pattern: `frontend/src/hooks/useAuth.ts` (useLogin já existe)
- Design system: `frontend/src/styles/app.css`
- Backend: `/auth/login` ✅ funciona, `/auth/register` ❓ verificar com Renato

---

### 2️⃣ Ian — Dashboard Feature

**Objetivo:** Implementar dashboard com KPIs e gráficos

#### Checklist de Tarefas

```
[ ] Ler docs/FRONTEND_ALIGNMENT_SUMMARY.md
[ ] Ler frontend/src/features/dashboard/README.md
[ ] Instalar recharts: npm install recharts
[ ] Implementar DashboardKPICard.tsx (componente mais simples)
[ ] Implementar CowsPerStatusChart.tsx (gráfico de pizza)
[ ] Implementar DashboardOverviewChart.tsx (gráfico de linha)
[ ] Implementar CowsPerFarmChart.tsx (gráfico de barra)
[ ] Criar hooks useDashboardOverview, useCowsPerStatus, etc.
[ ] Integrar com backend (substituir mock data)
[ ] Implementar período selector (hoje/semana/mês)
[ ] Testar responsividade em mobile/tablet/desktop
```

#### Arquivos a Trabalhar

- `frontend/src/features/dashboard/pages/DashboardPage.tsx`
- `frontend/src/features/dashboard/components/DashboardKPICard.tsx`
- `frontend/src/features/dashboard/components/DashboardOverviewChart.tsx`
- `frontend/src/features/dashboard/components/CowsPerStatusChart.tsx`
- `frontend/src/features/dashboard/components/CowsPerFarmChart.tsx`
- `frontend/src/features/dashboard/hooks/` (criar se necessário)
- `frontend/src/features/dashboard/services/` (criar se necessário)

#### Dependências Necessárias

```bash
npm install recharts
```

#### Mock Data Disponível

DashboardPage já tem mock data para desenvolvimento. Estrutura:

```typescript
const mockDashboardData = {
  totalCows: 150,
  healthyCows: 120,
  unhealthyCows: 30,
  totalFarms: 5,
  cowsPerStatus: [...],
  cowsPerFarm: [...]
};
```

#### Endpoints do Backend (Verificar com Renato)

- `GET /dashboard/overview?period=week` (ou day/month)
- `GET /dashboard/cows-per-status`
- `GET /dashboard/cows-per-farm`

#### Referências

- Exemplo de feature com componentes: `frontend/src/features/farms/`
- Design system: `frontend/src/styles/app.css`
- Recharts docs: https://recharts.org
- Padrão de hook com React Query: `frontend/src/hooks/useAuth.ts`

---

### 3️⃣ Jafte — (Você já implementou! 🎉)

**Status:** ✅ 5 features completas

- Farms (CRUD + detail)
- Cows (listagem + detail com charts)
- Collars (filtros + detail)
- Notifications (tabs todos/unread)
- Access (admin users/roles/permissions)

**Próximos passos** (opcional):
- [ ] Revisar implementações
- [ ] Adicionar testes
- [ ] Melhorias de UX/Performance

---

### 4️⃣ Renato — Backend

**Status:** 🟡 Em andamento

**Endpoints confirmados:**
- ✅ POST `/auth/login`
- ✅ GET `/auth/me`
- ✅ Todos os endpoints de farms, cows, collars, etc.

**Endpoints a verificar:**
- ❓ POST `/auth/register` (precisa para Angelo)
- ❓ GET `/dashboard/overview` (precisa para Ian)
- ❓ GET `/dashboard/cows-per-status` (precisa para Ian)
- ❓ GET `/dashboard/cows-per-farm` (precisa para Ian)

---

## 🔗 Documentação de Referência

Ler nesta ordem:

1. **Este arquivo:** `docs/IMPLEMENTATION_GUIDE.md` (você está aqui)
2. **Alinhamento Frontend:** `docs/FRONTEND_ALIGNMENT_SUMMARY.md`
3. **Arquitetura Frontend:** `docs/frontend-architecture.md`
4. **Arquitetura Backend:** `docs/backend-architecture.md`
5. **Esquema Prisma:** `backend/prisma/schema.prisma`

---

## 🛠️ Padrões de Desenvolvimento

### Feature Structure

Cada feature deve ter:

```typescript
// index.ts — Exports públicos
export { ComponentA } from './components/ComponentA';
export { ComponentB } from './components/ComponentB';
export type { TypeA } from './types';

// types/index.ts — Tipos específicos da feature
export interface FeatureData { ... }

// components/ — Componentes reutilizáveis da feature
export const ComponentA = () => { ... }

// pages/ — Páginas principais da feature
export const FeaturePage = () => { ... }

// services/ — API calls (opcional, usar globais se possível)
export const fetchFeatureData = () => { ... }

// hooks/ — Custom hooks (opcional)
export const useFeature = () => { ... }
```

### Componente com TODO

```typescript
/**
 * ComponentName
 * TODO[NOME]: Descrição do que precisa fazer
 */

export const ComponentName = () => {
  // TODO[NOME]: Implementar funcionalidade específica
  return <div>Skeleton/Placeholder</div>;
};
```

### Validação com react-hook-form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
};
```

---

## 📋 Checklist Geral

- [x] Estrutura de pastas criada para Angelo (auth)
- [x] Estrutura de pastas criada para Ian (dashboard)
- [x] README.md com tarefas específicas para Angelo
- [x] README.md com tarefas específicas para Ian
- [x] AppRoutes.tsx atualizado para usar DashboardPage
- [x] Componentes esqueleto com TODO[NOME]
- [x] Tipos básicos definidos
- [x] Mock data para Ian testar
- [ ] Angelo implementar LoginForm
- [ ] Angelo implementar RegisterForm
- [ ] Ian implementar KPI cards
- [ ] Ian implementar gráficos
- [ ] Ian integrar com backend
- [ ] Testes e QA

---

## 💬 Comunicação

**Quando precisar:**
- Angelo, Ian: Verificar README específico da sua feature
- Todos: Consultar `docs/FRONTEND_ALIGNMENT_SUMMARY.md`
- Renato: Verificar endpoints necessários acima
- Jafte: Revisar implementações e oferecer suporte

**Links úteis:**
- Frontend: `frontend/src/features/{auth,dashboard}/README.md`
- Bugs/Issues: Documentar em `docs/change_control/CHANGELOG.md`

---

## 🎉 Status Final

**Frontend:**
- ✅ Infraestrutura completa
- ✅ 5 features principais implementadas (Jafte)
- 🔴 Auth feature pendente (Angelo)
- 🔴 Dashboard feature pendente (Ian)

**Backend:**
- ✅ API principal funcionando
- ✅ Seed com dados de teste
- ❓ Endpoints de dashboard (a verificar com Renato)

**Próximo grande milestão:** Implementação completa de auth + dashboard

---

**Última atualização:** 2026-05-15 PM
