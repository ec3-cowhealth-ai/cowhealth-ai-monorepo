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
│   ├── pages/               # uma pasta por módulo, com a página e seus componentes locais
│   ├── services/            # funções de chamada à API usando Axios
│   ├── hooks/               # hooks customizados com React Query
│   ├── types/               # interfaces e tipos TypeScript
│   ├── lib/
│   │   ├── api.ts           # instância configurada do Axios
│   │   └── queryClient.ts   # instância global do QueryClient
│   ├── App.tsx              # definição das rotas
│   └── main.tsx             # ponto de entrada
├── index.html
├── vite.config.ts
└── tsconfig.app.json
```

---

## Responsabilidade de cada camada

### `lib/api.ts`
Instância configurada do Axios, compartilhada por todos os services. Configura baseURL, timeout e o interceptor que injeta o JWT em todas as requisições automaticamente.

```ts
// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
      staleTime: 1000 * 60, // 1 minuto
      retry: 1,
    },
  },
});
```

---

### `services/`
Funções que definem as chamadas à API usando a instância do Axios. Não conhecem React — são funções puras que recebem parâmetros e retornam dados.

```ts
// src/services/farmsService.ts
import api from "../lib/api";
import type { Farm, CreateFarmInput } from "../types/farm";

export const getFarms = () =>
  api.get<Farm[]>("/farms").then((res) => res.data);

export const getFarmById = (id: number) =>
  api.get<Farm>(`/farms/${id}`).then((res) => res.data);

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
// src/hooks/useFarms.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFarms, createFarm, deleteFarm } from "../services/farmsService";

export const useFarms = () => {
  return useQuery({
    queryKey: ["farms"],
    queryFn: getFarms,
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

export const useDeleteFarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFarm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farms"] });
    },
  });
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
│   ├── CowDetail.tsx       # gráficos de FC/temperatura + tabelas de sensores + galeria de fotos
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
  const { mutate: deleteFarm } = useDeleteFarm();

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

### `components/`
Componentes genéricos reutilizados em múltiplas páginas: botões, inputs, modais, tabelas, spinners, etc. Não contêm lógica de negócio nem chamadas à API.

```
components/
├── Button.tsx
├── Modal.tsx
├── Spinner.tsx
├── Table.tsx
└── Layout/
    ├── AppLayout.tsx    # layout principal com sidebar e header
    └── AuthLayout.tsx   # layout para login
```

---

### `types/`
Interfaces TypeScript compartilhadas entre páginas, hooks e services. Devem refletir os campos do schema do banco.

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
Define as rotas da aplicação com React Router. Rotas protegidas verificam autenticação antes de renderizar.

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/Layout/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { FarmsPage } from "./pages/farms/FarmsPage";

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/farms" element={<FarmsPage />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
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
lib/api.ts               → instância do Axios (baseURL, timeout, JWT)
    │
    ▼
API (backend Express)
```

---

## React Compiler

O React Compiler (React 19) otimiza re-renders automaticamente em tempo de compilação. Na prática isso significa que **`useMemo`, `useCallback` e `React.memo` não precisam ser escritos manualmente** na maioria dos casos.

Para habilitar, instalar e configurar no `vite.config.ts`:

```bash
npm install --save-dev babel-plugin-react-compiler
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
});
```

---

## Variáveis de ambiente

O Vite expõe apenas variáveis prefixadas com `VITE_` para o código do browser.

```dotenv
# frontend/.env
VITE_API_URL=http://localhost:3001
```
