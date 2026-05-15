# Frontend — Estrutura e Arquitetura

Guia de referência sobre a organização do código no frontend do projeto.

---

## Stack

| Ferramenta | Função |
|---|---|
| Vite | Bundler e servidor de desenvolvimento |
| React 19 + TypeScript | UI e tipagem estática |
| React Compiler | Otimização automática de re-renders (substitui `useMemo`/`useCallback` manual) |
| React Router | Roteamento e proteção de rotas |
| React Query | Cache, fetch e sincronização de estado do servidor |
| Axios | Cliente HTTP (usado dentro dos services) |
| Tailwind CSS | Estilização |
| Recharts | Gráficos (FC, temperatura, vacas por status, top fazendas) |
| React Hook Form | Gerenciamento de formulários com performance otimizada |
| Zod | Validação de schemas TypeScript-first |
| Vitest | Testes unitários e de integração |
| React Testing Library | Testes de componentes |

---

## Estrutura de pastas (conforme diretrizes do professor)

```
frontend/
├── public/
├── src/
│   ├── assets/              # imagens, fontes, ícones
│   ├── components/          # componentes reutilizáveis (sem lógica de negócio)
│   │   ├── common/          # Button, Input, Card, etc. (base reutilizáveis)
│   │   ├── layout/          # Header, Footer, Sidebar, PageLayout
│   │   ├── feedback/        # EmptyState, ErrorState, LoadingState
│   │   ├── charts/          # Wrappers Recharts (Design System mestre)
│   │   └── ProtectedRoute/  # redirecionamento para login
│   ├── features/            # organização por domínio (UI + regras da feature)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── farms/
│   │   ├── cows/
│   │   ├── collars/
│   │   ├── notifications/
│   │   └── access/
│   ├── pages/               # composição final de páginas
│   ├── hooks/               # hooks customizados com React Query
│   ├── services/            # funções de chamada à API usando Axios
│   ├── store/
│   │   ├── context/         # contextos React (se necessário estado global)
│   │   └── reducers/        # reducers para useReducer
│   ├── routes/
│   │   └── AppRoutes.tsx    # centralização de rotas
│   ├── config/
│   │   └── environment.ts   # variáveis de ambiente centralizadas
│   ├── lib/
│   │   ├── api.ts           # instância configurada do Axios
│   │   └── queryClient.ts   # instância global do QueryClient
│   ├── styles/              # CSS global e ajustes pontuais
│   ├── types/               # interfaces e tipos TypeScript
│   ├── utils/               # funções utilitárias
│   ├── App.tsx              # composição de providers
│   └── main.tsx             # ponto de entrada
├── index.html
├── .env
├── .env.example
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
└── package.json
```

---

## Responsabilidade de cada camada

### `lib/api.ts`
Instância configurada do Axios, compartilhada por todos os services. Configura baseURL, timeout e dois interceptors: um que injeta o JWT em todas as requisições, e outro que redireciona para o login quando o token expirar — sem interceptar erros do próprio endpoint de login.

```ts
// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Injeta o token JWT em todas as requisições automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redireciona para login quando o token expirar
// A rota /auth/login é ignorada para permitir exibir erro de credencial inválida
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRoute = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRoute) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

### `lib/queryClient.ts`
Instância global do React Query, configurada uma única vez.

```ts
// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,       // dados considerados frescos por 1 minuto
      retry: 1,                    // tenta novamente 1 vez em caso de erro
      refetchOnWindowFocus: false, // não recarrega ao voltar para a aba
    },
  },
});
```

---

### `services/`
Funções que definem as chamadas à API usando a instância do Axios. Não conhecem React — são funções puras que recebem parâmetros e retornam dados.

```ts
// src/services/authService.ts
import api from "../lib/api";
import type { AuthUser, LoginInput } from "../types/auth";

export const loginService = (data: LoginInput) =>
  api.post<{ token: string }>("/auth/login", data).then((response) => response.data);

export const getMeService = () =>
  api.get<AuthUser>("/auth/me").then((response) => response.data);
```

```ts
// src/services/farmsService.ts
import api from "../lib/api";
import type { Farm, CreateFarmInput } from "../types/farm";

export const getFarmsService = () =>
  api.get<Farm[]>("/farms").then((response) => response.data);

export const createFarmService = (data: CreateFarmInput) =>
  api.post<Farm>("/farms", data).then((response) => response.data);

export const updateFarmService = (id: number, data: CreateFarmInput) =>
  api.put<Farm>(`/farms/${id}`, data).then((response) => response.data);

export const deleteFarmService = (id: number) =>
  api.delete(`/farms/${id}`).then((response) => response.data);
```

---

### `hooks/`
Hooks customizados que encapsulam o React Query. As páginas e componentes consomem esses hooks — nunca chamam os services diretamente.

```ts
// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginService, getMeService } from "../services/authService";
import type { LoginInput } from "../types/auth";

const AUTH_QUERY_KEY = ["auth", "me"];

export const useMe = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn:  getMeService,
    // Só executa a query se houver token — evita chamadas desnecessárias
    enabled: !!localStorage.getItem("token"),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate    = useNavigate();

  return useMutation({
    mutationFn: (data: LoginInput) => loginService(data),
    onSuccess: async ({ token }) => {
      localStorage.setItem("token", token);
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      navigate("/");
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate    = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    navigate("/login");
  };

  return { logout };
};
```

```ts
// src/hooks/useFarms.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFarmsService, createFarmService, deleteFarmService } from "../services/farmsService";

const FARMS_QUERY_KEY = ["farms"];

export const useFarms = () => {
  return useQuery({
    queryKey: FARMS_QUERY_KEY,
    queryFn:  getFarmsService,
  });
};

export const useCreateFarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFarmService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FARMS_QUERY_KEY });
    },
  });
};

export const useDeleteFarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFarmService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FARMS_QUERY_KEY });
    },
  });
};
```

---

### `components/ProtectedRoute`
Redireciona para `/login` se não houver usuário autenticado. Usado no `App.tsx` para envolver todas as rotas privadas.

```tsx
// src/components/ProtectedRoute/index.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "../../hooks/useAuth";

export const ProtectedRoute = () => {
  const { data: authenticatedUser, isLoading } = useMe();

  if (isLoading) return <p>Carregando...</p>;

  if (!authenticatedUser) return <Navigate to="/login" replace />;

  return <Outlet />;
};
```

---

### `pages/`
Uma pasta por módulo do sistema. Cada pasta contém a página principal e os componentes exclusivos daquele módulo.

```
pages/
├── auth/
│   └── LoginPage.tsx
├── dashboard/
│   ├── DashboardPage.tsx
│   ├── StatsCards.tsx
│   └── FarmChart.tsx
├── farms/
│   ├── FarmsPage.tsx
│   ├── FarmForm.tsx
│   └── FarmRow.tsx
├── collars/
│   ├── CollarsPage.tsx
│   ├── CollarForm.tsx
│   └── CollarRow.tsx
├── cows/
│   ├── CowsPage.tsx
│   ├── CowDetail.tsx
│   ├── CowForm.tsx
│   └── SensorChart.tsx
├── notifications/
│   └── NotificationsPage.tsx
└── access/
    ├── users/
    ├── roles/
    └── permissions/
```

As páginas consomem os hooks e delegam a renderização para os componentes locais:

```tsx
// src/pages/farms/FarmsPage.tsx
import { useFarms, useDeleteFarm } from "../../hooks/useFarms";
import { FarmRow } from "./FarmRow";

export const FarmsPage = () => {
  const { data: farms, isLoading } = useFarms();
  const { mutate: deleteFarm }     = useDeleteFarm();

  if (isLoading) return <p>Carregando...</p>;

  return (
    <ul>
      {farms?.map((farm) => (
        <FarmRow key={farm.id} farm={farm} onDelete={deleteFarm} />
      ))}
    </ul>
  );
};
```

---

### `types/`
Interfaces TypeScript compartilhadas entre páginas, hooks e services. Devem refletir os campos do schema do banco.

```ts
// src/types/auth.ts
export interface LoginInput {
  email: string;
  password: string;
}

export interface Permission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  profile: "ADMIN" | "MANAGER" | "VIEWER";
  active: boolean;
  createdAt: string;
  roles: Role[];
  permissions: Permission[];
}
```

```ts
// src/types/farm.ts
export interface Farm {
  id: number;
  name: string;
  cnpj: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}

export interface CreateFarmInput {
  name: string;
  cnpj: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}
```

```ts
// src/types/cow.ts
export interface Cow {
  id: number;
  tag: string;
  name?: string;
  breed?: string;
  birthDate?: string;
  weight?: number;
  photos?: string[];
  status: "HEALTHY" | "CALVING" | "HEAT_STRESS" | "ALERT";
  farmId: number;
  collarId?: number;
}
```

```ts
// src/types/collar.ts
export interface Collar {
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  dataFrequency: "HIGHER" | "DEFAULT" | "LOWER";
}
```

---

### `App.tsx`
Define as rotas da aplicação. Rotas protegidas são envolvidas pelo `ProtectedRoute`.

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<p>Dashboard (TODO)</p>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);
```

---

## Padrão de Estrutura Interna de Componentes

Cada componente deve seguir a seguinte estrutura:

```
src/components/common/Button/
├── Button.tsx          # componente principal
├── Button.types.ts     # tipos/interfaces (opcional, se complexo)
├── index.ts            # exportação da pasta
└── Button.module.css   # estilos (se não usar Tailwind inline)
```

**Exemplo de componente com Tailwind:**

```tsx
// src/components/common/Button/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
  type = 'button',
}: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2 rounded font-medium disabled:opacity-50 ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
};
```

**Regras obrigatórias:**

- Um componente por arquivo (exceto tipos auxiliares)
- Nomes em PascalCase para componentes
- Arquivos index.ts/ts para facilitar importações
- Props tipadas explicitamente com interface
- Componentes focados em uma única responsabilidade

---

## Formulários — Validação e Tipagem

### Tipagem de Eventos (React 19)

Com React 19, `FormEvent` foi depreciado. Usar os tipos nativos do DOM:

| Situação | Tipo correto |
|---|---|
| `onSubmit` em formulário | `React.FormEvent<HTMLFormElement>` |
| `onChange` em input | `React.ChangeEvent<HTMLInputElement>` |

### React Hook Form + Zod

Para formulários, use **React Hook Form** com **Zod** para validação:

```tsx
// src/components/forms/LoginForm/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          {...register('email')}
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded"
        />
        {errors.email && (
          <p className="text-red-600 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <input
          {...register('password')}
          type="password"
          placeholder="Senha"
          className="w-full px-4 py-2 border rounded"
        />
        {errors.password && (
          <p className="text-red-600 text-sm">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
};
```

**Vantagens:**

- Validação declarativa e type-safe com Zod
- Performance otimizada com React Hook Form (re-renders apenas do campo alterado)
- Mensagens de erro automáticas
- Suporte a validação assíncrona

---

## Fluxo de dados

```
Página / Componente
    │
    ▼
Hook (React Query)       → gerencia cache, loading e error automaticamente
    │
    ▼
Service                  → define a chamada usando Axios
    │
    ▼
lib/api.ts               → instância do Axios (baseURL, timeout, JWT)
    │
    ▼
API (backend Express)
```

---

## Lazy Loading de Rotas e Componentes

Para otimizar performance, use `React.lazy()` com `Suspense` para rotas pesadas:

```tsx
// src/routes/AppRoutes.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@components/ProtectedRoute';
import { LoadingPage } from '@components/feedback/LoadingPage';

// Importação síncrona para rotas críticas
import { LoginPage } from '@pages/auth/LoginPage';

// Lazy loading para rotas não-críticas
const DashboardPage = lazy(() => import('@pages/dashboard/DashboardPage'));
const FarmsPage = lazy(() => import('@pages/farms/FarmsPage'));
const CowsPage = lazy(() => import('@pages/cows/CowsPage'));

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingPage />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="/farms"
          element={
            <Suspense fallback={<LoadingPage />}>
              <FarmsPage />
            </Suspense>
          }
        />
        <Route
          path="/cows"
          element={
            <Suspense fallback={<LoadingPage />}>
              <CowsPage />
            </Suspense>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
```

---

## Testes (Vitest + React Testing Library)

Configure testes com **Vitest** para unitários/integração e **React Testing Library** para componentes.

**Estrutura de testes:**

```
src/
├── components/
│   └── common/
│       └── Button/
│           ├── Button.tsx
│           ├── Button.test.tsx        # testes do componente
│           └── index.ts
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts                # testes do hook
└── utils/
    ├── validators.ts
    └── validators.test.ts              # testes da utilidade
```

**Exemplo de teste de componente:**

```tsx
// src/components/common/Button/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600');
  });
});
```

**Scripts de teste:**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## Variáveis de ambiente

O Vite expõe apenas variáveis prefixadas com `VITE_` para o código do browser.

```dotenv
# frontend/.env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=CowHealth AI
VITE_ENV=development
```

Centralizar em `src/config/environment.ts`:

```ts
export const environment = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  appName: import.meta.env.VITE_APP_NAME || 'CowHealth',
  env: import.meta.env.VITE_ENV || 'development',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
```

---

## Matriz de Responsabilidades

Esta matriz define ownership principal por área de tela para evitar sobreposição de implementação:

| Pessoa | Responsabilidade |
|---|---|
| Renato | Backend completo (responsabilidade total) |
| Angelo | Frontend das telas de autenticação e registro de usuários |
| Ian | Frontend dos dashboards e gráficos |
| Jafte | Frontend de todas as demais telas |

### Regra de dependência entre colegas

Sempre que uma página/componente depender do trabalho de outro responsável, criar o esqueleto e marcar explicitamente o ponto de integração com `TODO[NOME]`.

Exemplo:

```tsx
// src/pages/dashboard/DashboardPage.tsx
import { PageLayout } from "../../components/layout/PageLayout";

export const DashboardPage = () => {
  return (
    <PageLayout title="Dashboard">
      {/* TODO[IAN]: integrar componentes finais de gráficos e KPIs */}
      <section aria-label="area de dashboard">
        <p>Esqueleto de dashboard em integração.</p>
      </section>
    </PageLayout>
  );
};
```

Convenções obrigatórias:

- `TODO[ANGELO]` para dependências de autenticação/registro.
- `TODO[IAN]` para dependências de dashboard/gráficos.
- `TODO[JAFTE]` para dependências das demais telas.
- O TODO deve indicar de forma curta o que falta integrar.

## Diretrizes de Reuso e Baixo Acoplamento

### 1) Separar por responsabilidade

- `components/`: componentes compartilháveis e agnósticos de domínio (layout, tabela base, card base, estados vazios, feedback visual).
- `pages/<modulo>/`: composição da tela e componentes locais do módulo.
- `services/`: somente acesso a API.
- `hooks/`: orquestração de estado assíncrono e regras de cache.
- `types/`: contratos de dados.

### 2) Evitar duplicação de UI

- Se o mesmo padrão visual/comportamental aparecer em 2+ páginas, extrair para `src/components/`.
- Evitar copiar blocos de formulário/listagem; criar componentes parametrizados por props.
- Evitar classes utilitárias repetidas em múltiplos arquivos; concentrar variações no Design System mestre.

### 3) Reduzir acoplamento entre módulos

- Um módulo não deve importar componentes internos de outro módulo em `pages/`.
- Compartilhamento entre módulos deve passar por `components/`, `hooks/` ou `types/`.
- Preferir passagem de dados por props explícitas, evitando dependência implícita de estado global.

### 4) Contratos estáveis para componentes

- Definir interfaces de props pequenas, explícitas e tipadas.
- Expor callbacks orientadas a intenção (`onCreate`, `onSelect`, `onRetry`) em vez de detalhes de implementação.
- Não acoplar componentes de UI diretamente a chamadas de API.

## Padrão de Gráficos com Recharts (Design System Mestre)

Todos os gráficos do projeto devem usar `Recharts`, implementados dentro do Design System mestre do repositório.

Regras:

- Não criar gráficos fora dos componentes base de gráfico do Design System.
- Criar wrappers reutilizáveis no Design System para padronizar: cores, tipografia, grid, tooltip, legenda e responsividade.
- Páginas de dashboard devem consumir apenas esses wrappers, sem configuração visual duplicada em cada tela.
- Cada gráfico deve receber dados por props tipadas, sem conhecer fonte de dados (API/hook).
- Estados de loading/erro/vazio devem ser componentes de UI padronizados do próprio Design System.

Estrutura recomendada:

```text
src/components/charts/
  ChartContainer.tsx
  LineChartCard.tsx
  BarChartCard.tsx
  PieChartCard.tsx
  chartTheme.ts
```

---

## Atualização 2026-05-14 — Diretrizes do Professor (Expandido 2026-05-15)

### Escopo

- Estas diretrizes valem para o `frontend/`.
- Backend permanece sob responsabilidade total de Renato e sem alteração estrutural neste guia.
- Exceção documentada: React Compiler substitui React.memo manual — decisão aprovada.

### Estrutura alvo (frontend) — Conforme Diretrizes do Professor

```text
frontend/
  src/
    assets/                  # imagens, fontes, ícones
    components/
      common/                # Button, Input, Card, etc. (base reutilizáveis)
      layout/                # Header, Footer, Sidebar, PageLayout
      feedback/              # EmptyState, ErrorState, LoadingState
      charts/                # Wrappers Recharts (Design System mestre)
      ProtectedRoute/
    features/                # organização por domínio (UI + regras da feature)
      auth/
      dashboard/
      farms/
      cows/
      collars/
      notifications/
      access/
    pages/                   # composição final de páginas e entrada de rotas
    hooks/                   # hooks customizados com React Query
    services/                # chamadas à API via Axios
    store/
      context/               # contextos React (se necessário estado global)
      reducers/              # reducers para useReducer
    routes/
      AppRoutes.tsx
    config/
      environment.ts
    lib/
      api.ts
      queryClient.ts
    styles/
    types/
    utils/
    App.tsx
    main.tsx
```

### Dependências Obrigatórias

**Core:**
- `@tanstack/react-query` — Estado assíncrono (servidor)
- `axios` — Cliente HTTP
- `react-router-dom` — Roteamento

**Formulários:**
- `react-hook-form` — Gerenciamento de formulários
- `@hookform/resolvers` — Adaptadores de validação
- `zod` — Validação TypeScript-first

**Estado Global (opcional, conforme necessidade):**
- `zustand` (recomendado) ou `@reduxjs/toolkit` para estado complexo
- ⚠️ **Preferência do projeto:** React Query é suficiente para estado do servidor

**Testes:**
- `vitest` — Framework de testes
- `@testing-library/react` — Testes de componentes
- `@testing-library/user-event` — Simulação de interações

### Padrões obrigatórios de arquitetura

- **Separar por responsabilidade:** UI em `components/` e domínio em `features/`.
- **Um componente por arquivo**, com nome em PascalCase.
- **Componentes pequenos e focados**, sem acoplamento direto com API.
- **Services:** Não importam componentes; são funções puras.
- **Pages/Features:** Não chamam API diretamente; usam apenas hooks/services padronizados.
- **Dependências entre colegas:** Devem usar esqueleto com `TODO[NOME]`.
- **Estrutura interna de componentes:** Cada componente em pasta própria com `index.ts`.

### Padrão de rotas (Lazy Loading)

- Centralizar definição em `src/routes/AppRoutes.tsx`.
- Usar `React.lazy()` + `Suspense` para rotas não-críticas.
- Manter rotas críticas (login) com importação síncrona.
- Rotas privadas protegidas com `ProtectedRoute`.
- `App.tsx` apenas compõe providers globais e renderiza `AppRoutes`.

### Padrão de aliases (Vite)

Configurar em `vite.config.ts`:

```ts
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    "@assets": path.resolve(__dirname, "./src/assets"),
    "@components": path.resolve(__dirname, "./src/components"),
    "@features": path.resolve(__dirname, "./src/features"),
    "@pages": path.resolve(__dirname, "./src/pages"),
    "@hooks": path.resolve(__dirname, "./src/hooks"),
    "@services": path.resolve(__dirname, "./src/services"),
    "@store": path.resolve(__dirname, "./src/store"),
    "@routes": path.resolve(__dirname, "./src/routes"),
    "@config": path.resolve(__dirname, "./src/config"),
    "@lib": path.resolve(__dirname, "./src/lib"),
    "@utils": path.resolve(__dirname, "./src/utils"),
    "@types": path.resolve(__dirname, "./src/types"),
  },
}
```

### Variáveis de ambiente e configuração

- Manter `.env` e `.env.example` no frontend.
- Centralizar leitura de env em `src/config/environment.ts`.
- Nunca commitar `.env`; incluir no `.gitignore`.

```ts
export const environment = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  appName: import.meta.env.VITE_APP_NAME || 'CowHealth AI',
  env: import.meta.env.VITE_ENV || 'development',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
```

### Design System e gráficos (Recharts)

- Todos os gráficos com `Recharts` em `src/components/charts`.
- Criar wrappers reutilizáveis para: cores, tipografia, grid, tooltip, legenda, responsividade.
- **Proibido:** Configuração visual duplicada em páginas.
- Dashboards consomem wrappers prontos com props tipadas.
- Estados (loading/erro/vazio) com componentes padronizados do Design System.

### Formulários (React Hook Form + Zod)

- Usar `react-hook-form` para gestão de estado de formulário.
- Validação com `zod` para schemas TypeScript-first.
- Mensagens de erro automáticas tipadas.
- Suporte a validação assíncrona (ex: verificar email duplicado).

### Testes (Vitest + React Testing Library)

- Testes próximos aos componentes/hooks/utils (mesmo diretório).
- Nomenclatura: `*.test.ts` ou `*.test.tsx`.
- Cobertura mínima: componentes críticos, hooks, utilidades.
- Scripts: `npm run test`, `npm run test:ui`, `npm run test:coverage`.

### CI/CD (GitHub Actions)

Configurar pipeline com:
- Lint (ESLint)
- Type checking (TypeScript)
- Testes (Vitest)
- Build (Vite)

Exemplo `.github/workflows/frontend.yml`:

```yaml
name: Frontend Tests & Build
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
```

### Checklist de conformidade (frontend)

- ✅ Estrutura de pastas implementada conforme diretrizes.
- ✅ Rotas centralizadas em `src/routes` com lazy loading.
- ✅ Aliases configurados em `vite.config.ts`.
- ✅ `src/config/environment.ts` criado e centralizado.
- ✅ Componentes em `components/common`, `components/layout`, etc.
- ✅ Gráficos padronizados em `components/charts` com Recharts.
- ✅ Formulários usando React Hook Form + Zod.
- ✅ Testes com Vitest + React Testing Library.
- ✅ Marcações `TODO[NOME]` para dependências cruzadas.
- ✅ Lint, typecheck e build executando sem erro.
- ✅ CI/CD configurado (GitHub Actions ou similar).
- ✅ `.env` não commitado (incluído em `.gitignore`).

---
