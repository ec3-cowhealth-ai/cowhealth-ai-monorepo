# Plano de Execucao de TODOs — CowHealth AI

**Data:** 2026-05-22
**Autor:** Jafte (via analise de codebase)
**Para:** IA executora (Claude Code ou similar)

---

## Contexto Critico (Leia antes de tudo)

- Frontend: `frontend/` — React 19 + TypeScript + Vite + Tailwind CSS v4
- Backend: `backend/` — Express 5 + Prisma + MySQL + JWT
- Design system CSS: `frontend/src/styles/app.css` — use classes `.btn`, `.form-field`, `.form-field__input`, `.card`, `.kpi-card`, etc.
- CSS variables de cor/espaco: `var(--bg-app)`, `var(--text-primary)`, `var(--s-4)`, etc.
- Padrão de hooks: `useMutation` / `useQuery` do TanStack React Query
- Padrão de services: axios via `import api from "@lib/api"` ou `import api from "../lib/api"`
- Build de verificacao: `cd frontend && npm run build` — deve passar com 0 erros TypeScript

---

## BLOCO 1 — Backend: Criar endpoint POST /auth/register

**Responsavel original:** Renato
**Arquivos relevantes:**
- `backend/src/services/authService.ts` — adicionar funcao `register`
- `backend/src/controllers/authController.ts` — adicionar controller `registerController`
- `backend/src/routes/authRoutes.ts` — adicionar rota `POST /register`
- `backend/prisma/schema.prisma` — checar modelo `User` (campos obrigatorios)
- `backend/src/types/auth.ts` — checar/adicionar tipo `RegisterInput`

### Tarefa 1.1 — Adicionar tipo RegisterInput

Leia `backend/src/types/auth.ts`.

Adicione a interface:
```typescript
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}
```

### Tarefa 1.2 — Adicionar funcao register no authService

Leia `backend/src/services/authService.ts`.

Adicione ao final do arquivo:
```typescript
export const register = async ({ name, email, password }: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email ja cadastrado.");

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, profile: "VIEWER", active: true },
  });

  return { id: user.id, name: user.name, email: user.email };
};
```

Verifique no `backend/prisma/schema.prisma` os campos exatos do modelo `User` antes de escrever o `prisma.user.create`. O campo de senha pode ser `passwordHash` — confirme.

### Tarefa 1.3 — Adicionar registerController

Leia `backend/src/controllers/authController.ts`.

Adicione ao final:
```typescript
export const registerController = async (request: Request, response: Response): Promise<void> => {
  const { name, email, password } = request.body;
  const user = await register({ name, email, password });
  response.status(201).json(user);
};
```

Importe `register` do authService. Use o mesmo padrao de try/catch ou handler de erros ja presente no arquivo — verifique o padrao existente antes de escrever.

### Tarefa 1.4 — Adicionar rota POST /register

Leia `backend/src/routes/authRoutes.ts`.

Adicione:
```typescript
router.post("/register", registerController);
```

Importe `registerController` do authController.

### Verificacao Bloco 1

```bash
cd backend && npm run build
```

Deve compilar sem erros.

---

## BLOCO 2 — Frontend Auth: Instalar dependencias

**Contexto:** `react-hook-form`, `@hookform/resolvers` e `zod` NAO estao instalados ainda.

### Tarefa 2.1 — Instalar pacotes

```bash
cd frontend && npm install react-hook-form @hookform/resolvers zod
```

---

## BLOCO 3 — Frontend Auth: Implementar LoginForm

**Arquivo:** `frontend/src/features/auth/components/LoginForm.tsx`

Leia o arquivo atual. Ele tem o esqueleto com `useLogin` ja importado e os tipos `LoginFormData` de `../types`.

Substitua o conteudo completo com uma implementacao usando `react-hook-form` + `zod`:

- Schema zod: `email` (string().email()), `password` (string().min(6))
- Usar `useForm<LoginFormData>({ resolver: zodResolver(schema) })`
- Campos: `email` (type="email") e `password` (type="password")
- Classes CSS: `.form-field`, `.form-field__label`, `.form-field__input`
- Erros inline abaixo de cada campo com classe `.form-field__error` (cheque se essa classe existe em `app.css`, caso nao exista use `style={{ color: 'var(--danger)', fontSize: 'var(--t-sm)' }}`)
- Botao submit: classe `.btn .btn-primary .btn-lg`, disabled quando `isPending`
- Erro geral de autenticacao abaixo do formulario quando `isError`
- Link `<a href="/register">` ao final com texto "Nao tem conta? Registre-se"
- Integrar com `useLogin` ja existente: `login(data)` no `handleSubmit`

### Verificacao Tarefa 3

```bash
cd frontend && npm run build
```

---

## BLOCO 4 — Frontend Auth: Adicionar registerService

**Arquivo:** `frontend/src/services/authService.ts`

Leia o arquivo. Ele tem `loginService` e `getMeService`.

Adicione ao final:
```typescript
export const registerService = (data: { name: string; email: string; password: string }) =>
  api.post<{ id: number; name: string; email: string }>("/auth/register", data)
    .then((response) => response.data);
```

---

## BLOCO 5 — Frontend Auth: Adicionar hook useRegister

**Arquivo:** `frontend/src/hooks/useAuth.ts`

Leia o arquivo. Ele tem `useMe`, `useLogin`, `useLogout`.

Adicione apos `useLogin`:
```typescript
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      registerService(data),
    onSuccess: () => {
      navigate("/login");
    },
  });
};
```

Importe `registerService` de `"../services/authService"`.

---

## BLOCO 6 — Frontend Auth: Implementar RegisterForm

**Arquivo:** `frontend/src/features/auth/components/RegisterForm.tsx`

Leia o arquivo atual. Substitua o conteudo completo:

- Schema zod:
  - `name`: string().min(2, "Nome obrigatorio")
  - `email`: string().email("Email invalido")
  - `password`: string().min(8).regex(/[A-Z]/, "Precisa de letra maiuscula").regex(/[0-9]/, "Precisa de numero")
  - `confirmPassword`: string()
  - `.refine(data => data.password === data.confirmPassword, { message: "Senhas nao conferem", path: ["confirmPassword"] })`
- Usar `useRegister()` hook (criado no Bloco 5)
- Campos: `name`, `email`, `password`, `confirmPassword`
- Mesmas classes CSS que LoginForm (`.form-field`, `.form-field__input`, etc.)
- Erros inline por campo
- Botao submit com loading state
- Link para `/login` com texto "Ja tem conta? Entrar"
- Apos sucesso (onSuccess no hook) redireciona para `/login`

---

## BLOCO 7 — Frontend Auth: Criar RegisterPage e adicionar rota

### Tarefa 7.1 — Verificar se RegisterPage existe

Verifique se `frontend/src/pages/auth/RegisterPage.tsx` existe.

Se nao existir, crie com o padrao da `LoginPage.tsx` (leia ela primeiro):
- Container centralizado com `minHeight: "100dvh"`
- Card com `maxWidth: 400px`
- Titulo "CowHealth AI" com emoji
- Renderizar `<RegisterForm />`

### Tarefa 7.2 — Adicionar rota /register

Leia `frontend/src/routes/AppRoutes.tsx`.

Verifique se ja existe a rota `/register`. Se nao, adicione como rota publica (fora do `ProtectedRoute`), igual a `/login`.

Importe `RegisterPage` do local correto.

### Verificacao Bloco 7

```bash
cd frontend && npm run build
```

---

## BLOCO 8 — Frontend Dashboard: Instalar recharts

```bash
cd frontend && npm install recharts
```

Apos instalar, verifique se os tipos estao incluidos:
```bash
cd frontend && npm install --save-dev @types/recharts 2>/dev/null || true
```
(recharts >= 2.x inclui tipos nativamente, entao o segundo comando pode falhar — tudo bem)

---

## BLOCO 9 — Frontend Dashboard: Criar dashboardService

**Arquivo a criar:** `frontend/src/services/dashboardService.ts`

O backend ja possui os tres endpoints. Analise as respostas reais:

- `GET /dashboard/overview` retorna: `{ totalCows, cowsWithCollar, cowsInAlert, totalFarms, totalActiveCollars, unreadNotifications, topFarm: { id, name, cowCount } | null }`
- `GET /dashboard/cows-per-status` retorna: `Array<{ status: string, count: number }>`
- `GET /dashboard/cows-per-farm` retorna: `Array<{ id: number, name: string, cowCount: number }>`

Crie o arquivo com:
```typescript
import api from "@lib/api";

export const getDashboardOverview = () =>
  api.get("/dashboard/overview").then(r => r.data);

export const getCowsPerStatus = () =>
  api.get("/dashboard/cows-per-status").then(r => r.data);

export const getCowsPerFarm = () =>
  api.get("/dashboard/cows-per-farm").then(r => r.data);
```

---

## BLOCO 10 — Frontend Dashboard: Criar hooks de dashboard

**Arquivo a criar:** `frontend/src/features/dashboard/hooks/useDashboard.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import {
  getDashboardOverview,
  getCowsPerStatus,
  getCowsPerFarm,
} from "@services/dashboardService";

export const useDashboardOverview = () =>
  useQuery({ queryKey: ["dashboard", "overview"], queryFn: getDashboardOverview });

export const useCowsPerStatus = () =>
  useQuery({ queryKey: ["dashboard", "cows-per-status"], queryFn: getCowsPerStatus });

export const useCowsPerFarm = () =>
  useQuery({ queryKey: ["dashboard", "cows-per-farm"], queryFn: getCowsPerFarm });
```

Verifique o alias correto para `@services` — cheque `frontend/vite.config.ts` e `frontend/tsconfig.app.json`.

---

## BLOCO 11 — Frontend Dashboard: Implementar DashboardKPICard

**Arquivo:** `frontend/src/features/dashboard/components/DashboardKPICard.tsx`

Leia o arquivo atual. As props ja estao definidas: `title`, `value`, `unit`, `trend`, `trendPercent`.

Implemente usando a classe `.kpi-card` do design system (`app.css`). Padrao:
- Wrapper: `<div className="kpi-card">`
- `<p className="kpi-card__label">{title}</p>`
- `<p className="kpi-card__value">{value}<span className="kpi-card__unit">{unit}</span></p>`
- Se `trend` existir: `<p className="kpi-card__change kpi-card__change--positive/negative">` dependendo de `trend === 'up' | 'down'`
- Seta visual: texto unicode ou span simples ("↑" / "↓" / "→") + percentual

Nao instale nenhuma biblioteca de icones. Use unicode ou emoji simples.

---

## BLOCO 12 — Frontend Dashboard: Implementar CowsPerStatusChart (PieChart)

**Arquivo:** `frontend/src/features/dashboard/components/CowsPerStatusChart.tsx`

Leia o arquivo atual. Props: `data: ChartDataPoint[]` onde cada item tem `{ label: string, value: number }`.

Implemente com recharts `PieChart`:

```typescript
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
```

- Use `ResponsiveContainer width="100%" height={280}`
- Cores por label: "Saudaveis" → `#339989`, "Em Risco" → `#E8C66B`, "Doentes" → `#ef4444` (usar as variaveis do design system se possivel)
- Adicione `<Legend />` e `<Tooltip />`
- Titulo "Vacas por Status" acima do grafico
- Wrapper com `<div className="card">` e padding

---

## BLOCO 13 — Frontend Dashboard: Implementar CowsPerFarmChart (BarChart)

**Arquivo:** `frontend/src/features/dashboard/components/CowsPerFarmChart.tsx`

Leia o arquivo atual. Props: `data: ChartDataPoint[]`.

Implemente com recharts `BarChart`:

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
```

- Use `ResponsiveContainer width="100%" height={280}`
- `XAxis dataKey="label"`, `YAxis`
- `<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />`
- `<Bar dataKey="value" fill="#339989" radius={[4,4,0,0]} />`
- Titulo "Vacas por Fazenda" acima
- Wrapper com `<div className="card">`

---

## BLOCO 14 — Frontend Dashboard: Implementar DashboardOverviewChart (LineChart)

**Arquivo:** `frontend/src/features/dashboard/components/DashboardOverviewChart.tsx`

Leia o arquivo atual. Props: `data: ChartDataPoint[]`, `title: string`, `period`.

Implemente com recharts `LineChart`:

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
```

- Use `ResponsiveContainer width="100%" height={280}`
- `<Line type="monotone" dataKey="value" stroke="#339989" strokeWidth={2} dot={false} />`
- `XAxis dataKey="label"`, `YAxis`
- Titulo dinamico passado via prop
- Wrapper com `<div className="card">`

**Nota:** Este grafico usa os mesmos dados de `cowsPerStatus` no mock atual. Quando o backend tiver um endpoint de serie temporal, o tipo de dado mudara. Por ora, mantenha compatibilidade com `ChartDataPoint[]`.

---

## BLOCO 15 — Frontend Dashboard: Atualizar DashboardPage com dados reais

**Arquivo:** `frontend/src/features/dashboard/pages/DashboardPage.tsx`

Leia o arquivo atual. Substitua o conteudo completo:

1. Importe os hooks do Bloco 10:
   ```typescript
   import { useDashboardOverview, useCowsPerStatus, useCowsPerFarm } from "../hooks/useDashboard";
   ```

2. Importe `LoadingSpinner` de `@components/common`.

3. No componente, use os hooks reais e remova o `mockDashboardData`:
   ```typescript
   const { data: overview, isLoading: loadingOverview } = useDashboardOverview();
   const { data: cowsPerStatus, isLoading: loadingStatus } = useCowsPerStatus();
   const { data: cowsPerFarm, isLoading: loadingFarm } = useCowsPerFarm();

   const isLoading = loadingOverview || loadingStatus || loadingFarm;
   if (isLoading) return <LoadingSpinner />;
   ```

4. Mapeie os dados do backend para o formato dos componentes:
   - `overview` tem: `totalCows`, `cowsWithCollar`, `cowsInAlert`, `totalFarms`
   - `cowsPerStatus` tem items com `.status` e `.count` — mapeie para `{ label: item.status, value: item.count }`
   - `cowsPerFarm` tem items com `.name` e `.cowCount` — mapeie para `{ label: item.name, value: item.cowCount }`

5. Grid de KPI cards (use `<div className="grid grid--4">`):
   - "Total de Vacas" — `overview.totalCows`
   - "Com Colar" — `overview.cowsWithCollar`
   - "Em Alerta" — `overview.cowsInAlert`
   - "Fazendas" — `overview.totalFarms`

6. Grid de graficos (use `<div className="grid grid--2">` em desktop):
   - `<CowsPerStatusChart data={statusData} />`
   - `<CowsPerFarmChart data={farmData} />`
   - `<DashboardOverviewChart data={statusData} title="Distribuicao por Status" period="week" />` (grafico de linha usa os mesmos dados por ora)

7. Remova os comentarios TODO[IAN] apos implementar.

### Verificacao Bloco 15

```bash
cd frontend && npm run build
```

---

## BLOCO 16 — Frontend: Substituir SensorChart por grafico real (Recharts)

**Arquivo:** `frontend/src/features/cows/components/SensorChart.tsx`

**Pre-requisito:** recharts instalado (Bloco 8).

Leia o arquivo atual. Ele mostra min/avg/max como KPI cards, mas sem grafico visual.

Props atuais:
```typescript
interface SensorChartProps {
  data: Array<{ timestamp: string; value: number }>;
  title: string;
  unit: string;
  minThreshold?: number;
  maxThreshold?: number;
}
```

Mantenha os KPI cards de min/avg/max. Adicione abaixo deles um `LineChart` com recharts:

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
```

- `ResponsiveContainer width="100%" height={180}`
- `XAxis dataKey="timestamp"` — formatar para mostrar apenas hora (`.slice(11, 16)` ou `new Date(ts).toLocaleDateString('pt-BR', { month:'2-digit', day:'2-digit' })`)
- `<Line type="monotone" dataKey="value" stroke="#339989" strokeWidth={2} dot={false} />`
- Se `minThreshold` existir: `<ReferenceLine y={minThreshold} stroke="#E8C66B" strokeDasharray="4 4" />`
- Se `maxThreshold` existir: `<ReferenceLine y={maxThreshold} stroke="#ef4444" strokeDasharray="4 4" />`
- `<Tooltip formatter={(v) => [`${v} ${unit}`, title]} />`

### Verificacao Bloco 16

```bash
cd frontend && npm run build
```

---

## Verificacao Final Completa

Apos todos os blocos:

```bash
# Frontend
cd frontend
npm run lint
npm run build

# Backend
cd ../backend
npm run build
```

Ambos devem passar com 0 erros.

---

## Ordem de Execucao Recomendada

```
Bloco 1  (backend register)        — independente, pode ser feito primeiro
Bloco 2  (npm install auth)        — pre-req para 3,4,5,6,7
Bloco 3  (LoginForm)               — apos Bloco 2
Bloco 4  (registerService)         — apos Bloco 2
Bloco 5  (useRegister hook)        — apos Bloco 4
Bloco 6  (RegisterForm)            — apos Bloco 5
Bloco 7  (RegisterPage + rota)     — apos Bloco 6
Bloco 8  (npm install recharts)    — pre-req para 12,13,14,16
Bloco 9  (dashboardService)        — apos confirmar Bloco 1
Bloco 10 (dashboard hooks)         — apos Bloco 9
Bloco 11 (DashboardKPICard)        — apos Bloco 8
Bloco 12 (CowsPerStatusChart)      — apos Bloco 8
Bloco 13 (CowsPerFarmChart)        — apos Bloco 8
Bloco 14 (DashboardOverviewChart)  — apos Bloco 8
Bloco 15 (DashboardPage real)      — apos Blocos 9,10,11,12,13,14
Bloco 16 (SensorChart recharts)    — apos Bloco 8, independente do dashboard
```

---

## Notas Importantes

- **NAO** instale bibliotecas de icones (Heroicons, Lucide, etc.) — use unicode/emoji
- **NAO** use Tailwind inline — use classes do design system de `app.css`
- **NAO** mude a estrutura de pastas nem crie arquivos extras
- **SEMPRE** rode `npm run build` apos cada bloco para validar
- **SEMPRE** leia o arquivo antes de editar
- O alias `@lib/api` aponta para `frontend/src/lib/api.ts` — confirme no `vite.config.ts` antes de usar
- O alias `@services` pode nao existir — use caminho relativo `"../../services/dashboardService"` se necessario

---

**Ultimo update:** 2026-05-22