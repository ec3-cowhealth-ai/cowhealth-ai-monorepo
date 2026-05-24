# Dashboard Feature

**Responsável:** Ian

## 📋 Tarefas

### ✅ Implementado

- Estrutura de pastas criada
- Tipos básicos definidos
- Componentes esqueleto criados
- DashboardPage estruturada
- Mock data para desenvolvimento

### 🚀 TODO

#### 1. KPI Cards

**Arquivo:** `components/DashboardKPICard.tsx`

- [ ] Estilizar card com Tailwind CSS
- [ ] Implementar ícones apropriados:
  - "Vacas Saudáveis" → ✓
  - "Em Risco" → ⚠️
  - "Doentes" → 🔴
  - "Fazendas Ativas" → 🏠
- [ ] Adicionar indicador de tendência (seta + percentual)
- [ ] Responsivo em mobile
- [ ] Hover effect / transições

#### 2. Overview Chart

**Arquivo:** `components/DashboardOverviewChart.tsx`

- [ ] Instalar `recharts`:
  ```bash
  npm install recharts
  ```
- [ ] Implementar gráfico de linha (LineChart)
- [ ] Período selector (hoje/semana/mês)
- [ ] Tooltip com detalhes
- [ ] Responsivo em mobile

#### 3. Cows Per Status Chart

**Arquivo:** `components/CowsPerStatusChart.tsx`

- [ ] Implementar gráfico de pizza (PieChart)
- [ ] Cores por status:
  - Healthy: Verde (#10b981)
  - At-risk: Laranja (#f59e0b)
  - Sick: Vermelho (#ef4444)
- [ ] Labels com percentual
- [ ] Legend

#### 4. Cows Per Farm Chart

**Arquivo:** `components/CowsPerFarmChart.tsx`

- [ ] Implementar gráfico de barras (BarChart)
- [ ] Ordenar fazendas por quantidade
- [ ] Tooltip com detalhes
- [ ] Responsivo

#### 5. DashboardPage

**Arquivo:** `pages/DashboardPage.tsx`

- [ ] Criar hooks para buscar dados
- [ ] Grid layout responsivo (desktop: 2-3 cols, mobile: 1 col)
- [ ] Loading state (skeleton ou spinner)
- [ ] Seção de alertas recentes (últimos 5)

#### 6. Hooks e Services

**Criar em:** `hooks/` e `services/` ou usar globais

- [ ] `useDashboardOverview()` → GET `/dashboard/overview?period=week`
- [ ] `useCowsPerStatus()` → GET `/dashboard/cows-per-status`
- [ ] `useCowsPerFarm()` → GET `/dashboard/cows-per-farm`

## 🔗 Links Úteis

- **Backend endpoints:** `docs/backend-architecture.md` (seção Dashboard)
- **Recharts docs:** https://recharts.org
- **Design System:** `frontend/src/styles/app.css`
- **AppBar component:** `frontend/src/components/layout/AppBar.tsx`
- **Exemplo de Feature:** `frontend/src/features/farms/`

## 📦 Dependências

```bash
npm install recharts
```

## 🎨 Design Reference

- Card layout: `frontend/src/features/farms/pages/FarmsPage.tsx`
- Cores do design system: `frontend/src/styles/app.css`
- Layout de página: `frontend/src/pages/home/HomePage.tsx`

## 📊 Mock Data

DashboardPage já possui mock data para desenvolvimento. Substitua após integrar com backend.

## 💡 Próximos Passos

1. Implementar KPI cards (mais simples)
2. Implementar gráficos um a um (começar com pizza)
3. Criar hooks e services
4. Integrar com backend
5. Testar responsividade
6. Adicionar período selector
7. Implementar alertas recentes

## 🎯 Prioridade

1. **Alto:** KPI cards + gráfico de pizza
2. **Médio:** Gráficos de linha e barra
3. **Baixo:** Alertas recentes
