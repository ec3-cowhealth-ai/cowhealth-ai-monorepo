# Frontend Build — Chunk Size Warning

**Data:** 2026-05-25  
**Afeta:** `frontend/` — build de produção  
**Severidade:** ⚠️ Warning (não bloqueia o build, não afeta funcionalidade)

---

## O que é

Ao executar `npm run build` no frontend, aparece o seguinte aviso:

```
dist/assets/index-rXvk-icc.js   1,030.52 kB │ gzip: 304.68 kB

(!) Some chunks are larger than 500 kB after minification.
```

O Vite avisa que o bundle JS principal tem **1.03 MB** minificado (304 KB com gzip), acima do limite recomendado de 500 KB.

---

## Por que acontece

O projeto usa três bibliotecas pesadas que são carregadas juntas no bundle inicial:

| Biblioteca | Uso | Peso estimado |
|------------|-----|---------------|
| `recharts ^3.8.1` | Gráficos no dashboard | ~400 KB |
| `leaflet ^1.9.4` + `react-leaflet ^5.0.0` | Mapa GPS das vacas | ~150 KB |
| `lucide-react ^1.16.0` | Ícones em todas as páginas | ~80 KB |

Como não há **code splitting** configurado, todo esse código vai para um único arquivo `index.js` que é carregado no primeiro acesso — independente de qual página o usuário abre.

---

## Impacto real

| Cenário | Impacto |
|---------|---------|
| **Desenvolvimento local** | Nenhum — Vite usa HMR, não bundle |
| **Produção — primeira carga** | ~304 KB transferidos (gzip). Em 4G: ~1-2s. Em 3G: ~5-8s. |
| **Produção — visitas seguintes** | Nenhum — o browser cacheia o bundle |
| **Funcionalidade** | Nenhum — tudo funciona normalmente |

Para uma aplicação interna/B2B como o CowHealth (acesso em fazendas, possível 3G), vale resolver antes do deploy em produção.

---

## Como resolver (quando for o momento)

A solução é **lazy loading** das páginas via `React.lazy` + `Suspense` no `AppRoutes.tsx`. Cada página vira um chunk separado e só é carregada quando o usuário navega até ela.

**Exemplo — `AppRoutes.tsx`:**

```tsx
import { lazy, Suspense } from "react";

// Antes:
import { DashboardPage } from "@features/dashboard/pages/DashboardPage";
import { MapPage } from "@pages/map/MapPage";

// Depois:
const DashboardPage = lazy(() => import("@features/dashboard/pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const MapPage = lazy(() => import("@pages/map/MapPage").then(m => ({ default: m.MapPage })));

// Envolver o <Routes> com Suspense:
<Suspense fallback={<div>Carregando...</div>}>
  <Routes>
    ...
  </Routes>
</Suspense>
```

Resultado esperado: bundle inicial cai para ~200 KB. Recharts e Leaflet só são carregados quando o usuário abre o Dashboard ou o Mapa.

---

## Status

- [x] Warning identificado e documentado
- [ ] Lazy loading implementado (pendente — baixa prioridade)

---

## Referências

- [Vite — Code Splitting](https://vitejs.dev/guide/build#chunking-strategy)
- [React — lazy + Suspense](https://react.dev/reference/react/lazy)
