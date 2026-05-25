# Plano: Light Mode para CowHealth AI

## Contexto
O app está 100% dark theme hard-coded. O usuário quer adicionar um modo light com paleta neutra quente, ativado por botão manual (persiste no localStorage).

---

## Abordagem

### 1. Variáveis Light Theme — `frontend/src/styles/landing.css`

Adicionar bloco `[data-theme="light"]` após o `:root` (linha 82):

```css
[data-theme="light"] {
  --bg-canvas:        #F2F2F0;
  --bg-app:           #FAFAF8;
  --bg-elev-1:        #FFFFFF;
  --bg-elev-2:        #EFEFED;
  --bg-elev-3:        #E5E5E3;

  --border-subtle:    rgba(19, 21, 21, 0.06);
  --border:           rgba(19, 21, 21, 0.12);
  --border-strong:    rgba(19, 21, 21, 0.22);

  --text-primary:     #131515;
  --text-secondary:   rgba(19, 21, 21, 0.62);
  --text-muted:       rgba(19, 21, 21, 0.40);
  --text-inverse:     #FAFAF8;

  --shadow-1: 0 1px 3px rgba(0,0,0,0.10), 0 0 0 1px var(--border-subtle);
  --shadow-2: 0 8px 24px rgba(0,0,0,0.14), 0 0 0 1px var(--border-subtle);

  /* primary, success, danger, warning, info ficam iguais ao dark */
  --primary-soft:     rgba(51, 153, 137, 0.12);
  --accent-soft:      rgba(125, 226, 209, 0.25);
  --accent-on:        #131515;
}
```

O seletor `[data-theme="light"]` aplicado no `<html>` cascateia para todo o app.

---

### 2. Hook `useTheme` — `frontend/src/hooks/useTheme.ts` (novo arquivo)

```ts
import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) ?? 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle };
}
```

---

### 3. Inicialização sem flash (FOUC) — `frontend/index.html`

Adicionar script inline no `<head>` antes dos outros scripts:

```html
<script>
  (function() {
    var t = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```

---

### 4. Botão toggle na Sidebar — `frontend/src/components/layout/Sidebar.tsx`

- Importar `useTheme` e `Sun`, `Moon` do `lucide-react`
- Adicionar botão no `sidebar__footer` ao lado do logout:

```tsx
import { useTheme } from '@hooks/useTheme';
import { Sun, Moon, LogOut } from 'lucide-react';

// dentro do componente:
const { theme, toggle } = useTheme();

// no sidebar__footer, antes do botão de logout:
<button onClick={toggle} className="sidebar__logout" title="Alternar tema">
  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
</button>
```

#### Mobile — `frontend/src/components/layout/BottomNav.tsx`

Adicionar botão de tema no `BottomNav` (ou no AppBar se existir):

```tsx
import { useTheme } from '@hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

// botão extra no nav ou fora do map de NAV_ITEMS
const { theme, toggle } = useTheme();

<button className="bottom-nav__item" onClick={toggle}>
  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
  <span>Tema</span>
</button>
```

---

### 5. Revisão de cores hard-coded — `frontend/src/styles/App.css`

Verificar se há hex/rgb sem variáveis CSS nos backgrounds e textos principais e substituir pelas variáveis correspondentes (`--bg-app`, `--text-primary`, etc.).

---

## Arquivos a Modificar

| Arquivo | Ação |
|---|---|
| `frontend/src/styles/landing.css` | Adicionar bloco `[data-theme="light"]` após linha 82 |
| `frontend/index.html` | Script anti-FOUC no `<head>` |
| `frontend/src/hooks/useTheme.ts` | Criar hook (novo arquivo) |
| `frontend/src/components/layout/Sidebar.tsx` | Botão toggle no `sidebar__footer` |
| `frontend/src/components/layout/BottomNav.tsx` | Botão toggle no mobile |
| `frontend/src/styles/App.css` | Revisar hard-coded colors (se houver) |

---

## Verificação

1. `npm run dev` no frontend
2. Clicar no botão toggle → app muda para light
3. Recarregar página → tema persiste (localStorage)
4. Inspecionar `<html data-theme="light">` no DevTools
5. Checar: sidebar, cards KPI, tabela, badges, modal, formulários, mapa
