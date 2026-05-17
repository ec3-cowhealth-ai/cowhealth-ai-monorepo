# Features — Organização por Domínio

Cada feature é um domínio completo da aplicação com seus componentes, hooks, tipos e lógica.

## Estrutura Recomendada por Feature

```
features/auth/
├── components/          # Componentes específicos (FormLogin, FormRegister, etc.)
├── hooks/               # Hooks customizados da feature
├── types/               # Tipos específicos da feature
├── services/            # Services específicos da feature (opcional)
├── index.ts             # Exports públicos
└── README.md            # Documentação da feature
```

## Padrão de Imports

### ❌ Errado (acoplamento entre features)
```tsx
import { LoginForm } from '@features/auth/components/LoginForm';

export const DashboardPage = () => { ... }
```

### ✅ Correto (componentes compartilhados)
```tsx
import { Button } from '@components/common/Button';
import { LoginForm } from '@features/auth/components/LoginForm';

export const DashboardPage = () => { ... }
```

## Features do CowHealth AI

| Feature | Responsável | Descrição |
|---------|------------|-----------|
| `auth/` | Angelo | Autenticação, login, registro |
| `dashboard/` | Ian | Dashboard, gráficos, KPIs |
| `farms/` | Jafte | Gerenciamento de fazendas |
| `cows/` | Jafte | Gerenciamento de vacas, saúde |
| `collars/` | Jafte | Gerenciamento de coleiras (wearables) |
| `notifications/` | Jafte | Centro de notificações, alertas |
| `access/` | Jafte | Controle de acesso (usuários, roles, permissões) |

## Regra de Dependência (TODO[NOME])

Quando uma feature depender do trabalho de outro responsável:

```tsx
// src/features/farms/FarmsPage.tsx
export const FarmsPage = () => {
  return (
    <div>
      <h1>Fazendas</h1>
      {/* TODO[JAFTE]: Integrar listagem completa de fazendas */}
      <p>Carregando...</p>
    </div>
  );
};
```

Convenções:
- `TODO[ANGELO]` — Autenticação/Registro
- `TODO[IAN]` — Dashboard/Gráficos
- `TODO[JAFTE]` — Demais features
