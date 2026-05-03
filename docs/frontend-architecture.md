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
├── public/
├── src/
│   ├── components/          # componentes reutilizáveis (sem lógica de negócio)
│   │   └── ProtectedRoute/  # redirecionamento para login se não autenticado
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
└── vite.config.ts
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

## Formulários — tipagem de eventos

Com React 19, `FormEvent` foi depreciado. Usar os tipos nativos do DOM:

| Situação | Tipo correto |
|---|---|
| `onSubmit` em formulário | `React.SubmitEvent` |
| `onChange` em input | `React.ChangeEvent<HTMLInputElement>` |

```tsx
const handleSubmit = (event: React.SubmitEvent) => {
  event.preventDefault();
  login({ email, password });
};
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
lib/api.ts               → instância do Axios (baseURL, timeout, JWT)
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
