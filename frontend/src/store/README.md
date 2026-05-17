# Store — Estado Global

Centraliza estado global da aplicação.

## Estrutura

- `context/` — Contextos React para estado global
  - Criar contextos quando necessário estado compartilhado entre múltiplas features
  - Exemplo: ThemeContext, NotificationContext, UIContext

- `reducers/` — Reducers para useReducer
  - Usar quando a lógica de estado é complexa
  - Exemplo: authReducer (se não usar React Query), uiReducer

## Nota sobre React Query

⚠️ **Preferência do projeto:** React Query (`src/hooks/`) é suficiente para estado assíncrono (servidor).

Use `store/context/` apenas para:
- Estado UI (tema, modal aberto, etc.)
- Estado que deve ser compartilhado globalmente
- Estado síncrono que não vem do servidor

## Exemplo de Contexto

```tsx
// src/store/context/ThemeContext.tsx
import { createContext, useContext, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return context;
};
```
