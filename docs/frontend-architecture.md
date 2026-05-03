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

---

## Estrutura de pastas

```
frontend/
├── public/                  # arquivos estáticos (favicon, etc.)
├── src/
│   ├── components/          # componentes reutilizáveis (sem lógica de negócio)
│   ├── hooks/               # hooks customizados com React Query
│   ├── lib/
│   │   ├── api.ts           # instância configurada do Axios
│   │   └── queryClient.ts   # instância global do QueryClient
│   ├── pages/               # uma pasta por módulo, com a página e seus componentes locais
│   ├── services/            # funções de chamada à API usando Axios
│   ├── styles/              # CSS global e ajustes pontuais
│   ├── types/               # interfaces e tipos TypeScript
│   ├── App.tsx              # definição das rotas
│   └── main.tsx             # ponto de entrada
├── index.html
├── .env
├── .env.example
├── vite.config.ts
└── tsconfig.app.json
```

---

## Responsabilidade de cada camada

### `lib/api.ts`
Instância configurada do Axios, compartilhada por todos os services. Injeta o JWT automaticamente e redireciona para login quando o token expirar — exceto na rota de login em si.

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

// Redireciona para o login quando o token expirar.
// A rota de login é ignorada — um 401 ali significa credencial errada,
// não token expirado, e deve ser tratado pelo useLogin normalmente.
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
  api.post<{ token: string }>("/auth/login", data).then((res) => res.data);

export const getMeService = () =>
  api.get<AuthUser>("/auth/me").then((res) => res.data);
```

```ts
// src/services/farmsService.ts
import api from "../lib/api";
import type { Farm, CreateFarmInput } from "../types/farm";

export const getFarms = () =>
  api.get<Farm[]>("/farms").then((res) => res.data);

export const createFarm = (data: CreateFarmInput) =>
  api.post<Farm>("/farms", data).then((res) => res.data);

export const updateFarm = (id: number, data: CreateFarmInput) =>
  api.put<Farm>(`/farms/${id}`, data).then((res) => res.data);

export const deleteFarm = (id: number) =>
  api.delete(`/farms/${id}`).then((res) => res.data);
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
import { getFarms, createFarm, deleteFarm } from "../services/farmsService";

export const useFarms = () => {
  return useQuery({
    queryKey: ["farms"],
    queryFn:  getFarms,
  });
};

export const useCreateFarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFarm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farms"] });
    },
  });
};
```

---

### `components/`
Componentes genéricos reutilizados em múltiplas páginas. Não contêm lógica de negócio nem chamadas à API.

```
components/
├── ProtectedRoute/
│   └── index.tsx    # redireciona para /login se não autenticado
├── Layout/
│   ├── AppLayout.tsx    # layout principal com sidebar e header
│   └── AuthLayout.tsx   # layout para login
├── Button.tsx
├── Modal.tsx
├── Spinner.tsx
└── Table.tsx
```

```tsx
// src/components/ProtectedRoute/index.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "../../hooks/useAuth";

export const ProtectedRoute = () => {
  const { data: user, isLoading } = useMe();

  if (isLoading) return <p>Carregando...</p>;

  if (!user) return <Navigate to="/login" replace />;

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

---

### `types/`
Interfaces TypeScript alinhadas com o schema do banco.

```ts
// src/types/auth.ts
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  profile: "ADMIN" | "MANAGER" | "VIEWER";
  active: boolean;
  createdAt: string;
  roles: { id: number; name: string }[];
  permissions: { id: number; name: string }[];
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
Define as rotas com React Router. Rotas protegidas passam pelo `ProtectedRoute`.

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
          <Route path="/" element={<p>Dashboard (em breve)</p>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);
```

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
lib/api.ts               → instância do Axios (baseURL, timeout, JWT, interceptors)
    │
    ▼
API (backend Express)
```

---

## Variáveis de ambiente

O Vite expõe apenas variáveis prefixadas com `VITE_` para o código do browser.

```dotenv
# frontend/.env
VITE_API_URL=http://localhost:3001
```

---

## Observações

- Handlers de formulário usam `React.SubmitEvent` em vez do depreciado `React.FormEvent` (alinhado com React 19.2.10+).
- O interceptor de 401 do Axios ignora a rota `/auth/login` — um 401 ali é credencial errada, não token expirado.
- O `useMe` só executa se houver token no `localStorage` — evita chamadas desnecessárias antes do login.

---
