# Plano de Hotfixes TypeScript

> Origem: revisão `/ts-review` em `jcfs/frontEndDesign` — 2026-05-24
> Convenções aplicadas: `.claude/skills/SKILL.md`

---

## JCFS — Tipos compartilhados e mapa

Responsável pelos arquivos `frontend/src/types/`, `frontend/src/pages/map/` e
`frontend/src/features/auth/types/`.

---

### HF-01 — Sintaxe de array: `T[]` → `Array<T>`

**Arquivos:** `types/auth.ts`, `types/cows.ts`, `types/collars.ts`

**TODOs**

```ts
// types/auth.ts:23-24
roles: Role[];          → roles: Array<Role>;
permissions: Permission[]; → permissions: Array<Permission>;

// types/cows.ts:18
photos?: string[];      → photos?: Array<string>;

// types/cows.ts:50 (dentro de SensorPage<TData>)
data: T[];              → data: Array<TData>;
```

**Por que?**
A forma `T[]` é açúcar sintático aceitável em JavaScript, mas o guia do projeto
padroniza `Array<T>` para consistência com `ReadonlyArray<T>` e para tornar
genéricos aninhados mais legíveis (ex.: `Array<Array<ChartDataPoint>>` vs
`ChartDataPoint[][]`). Uniformidade facilita buscas e linting automático.

---

### HF-02 — Constantes em `UPPER_SNAKE_CASE`

**Arquivos:** `types/cows.ts`, `types/collars.ts`

**TODOs**

```ts
// types/cows.ts:1
const CowStatusValues = { ... } as const
→ const COW_STATUS_VALUES = { ... } as const

// types/collars.ts:1
const CollarStatusValues = { ... } as const
→ const COLLAR_STATUS_VALUES = { ... } as const

// types/collars.ts:11
const DataFrequencyValues = { ... } as const
→ const DATA_FREQUENCY_VALUES = { ... } as const
```

Atualizar também **todos os usos nos arquivos que importam essas constantes**:
- `pages/map/MapPage.tsx` — `CowStatusValues.*` em 4 lugares
- `features/cows/components/CowStatusBadge.tsx` — verificar
- `features/cows/pages/CowsPage.tsx` — verificar

**Por que?**
`CowStatusValues` em PascalCase parece uma classe ou namespace, criando
ambiguidade de leitura. Constantes de módulo (valores runtime fixos declarados
com `const`) seguem `UPPER_SNAKE_CASE` pela convenção do guia. A confusão é
real: `new CowStatusValues()` parece possível; `new COW_STATUS_VALUES()` é
obviamente um erro.

> Nota: `UserProfileValues` em `types/access.ts` tem o mesmo problema, mas
> pertence ao escopo de Angelo (HF-Angelo-05).

---

### HF-03 — Generic sem prefixo `T` em `SensorPage`

**Arquivo:** `types/cows.ts:49`

**TODO**

```ts
// Antes
export interface SensorPage<T> {
  data: T[];
  pagination: { ... };
}

// Depois
export interface SensorPage<TData> {
  data: Array<TData>;
  pagination: { ... };
}
```

Atualizar usos em `services/cowsService.ts` e qualquer outro arquivo que
instancie `SensorPage<algo>`.

**Por que?**
O guia exige prefixo `T` em parâmetros genéricos para diferenciá-los de tipos
concretos. `<T>` bare é ambíguo quando há múltiplos genéricos (`<T, K, V>`).
`<TData>` deixa claro que é um placeholder de tipo, não um tipo real chamado `T`.

---

### HF-04 — `as Cow | undefined` em MapPage

**Arquivo:** `pages/map/MapPage.tsx:36`

**TODO**

```ts
// Antes
const cow = cows[i] as Cow | undefined;

// Depois — anotação sem cast, zero mudança de comportamento
const cow: Cow | undefined = cows[i];
```

**Por que?**
`cows` é `Cow[]` (retorno do React Query). Sem `noUncheckedIndexedAccess` no
tsconfig, `cows[i]` tem tipo `Cow` — o compilador não sabe que pode ser
`undefined` se `i >= cows.length`. O desenvolvedor usou `as` para "corrigir"
isso, mas `as` silencia o compilador em vez de informá-lo.

A anotação explícita `const cow: Cow | undefined` comunica a mesma intenção ao
leitor, não usa cast, e o restante do código já usa `cow?.status` (optional
chaining) — portanto funciona corretamente. Alternativa futura: habilitar
`noUncheckedIndexedAccess` no tsconfig para que o compilador infira `Cow | undefined`
automaticamente em todos os acessos de array por índice.

---

### HF-05 — `AuthUser` duplicado

**Arquivos:**
- `frontend/src/features/auth/types/index.ts` — `AuthUser` com `id: string`, `fullName?`, `role?`
- `frontend/src/types/auth.ts` — `AuthUser` com `id: number`, `name`, `profile`, `roles[]`, `permissions[]`

As duas interfaces têm o mesmo nome mas shapes completamente diferentes.
`authService.ts` usa a segunda. A primeira é um remanescente que divergiu.

**TODOs**

1. Verificar quais arquivos importam de `features/auth/types/index.ts`
2. Migrar esses imports para `types/auth.ts`
3. Deletar `features/auth/types/index.ts` (ou transformá-lo em re-export se
   houver outros tipos exclusivos lá — `LoginFormData`, `RegisterFormData`)
4. Consolidar: `LoginFormData` e `RegisterFormData` podem ir para `types/auth.ts`
   ou o arquivo pode re-exportar de lá

**Por que?**
Dois tipos com o mesmo nome em caminhos diferentes criam bugs silenciosos: um
componente pode importar o `AuthUser` errado e ter acesso a campos inexistentes
em runtime (ex.: `user.fullName` retorna `undefined` porque o backend envia
`name`). É o tipo de bug que não aparece no `tsc` mas quebra a UI.

---

### HF-06 — `CollarListItem` como alias trivial

**Arquivo:** `types/collars.ts:37`

```ts
// Atual — alias sem diferença
export type CollarListItem = Collar;
```

**TODOs — escolher uma opção:**

- **Opção A (preferida):** Remover `CollarListItem` e usar `Collar` diretamente
  em todos os lugares que importam o alias
- **Opção B:** Se a lista realmente omite campos do detalhe, usar
  `Omit<Collar, 'cow'>` para refletir isso — análogo ao `CowListItem`

**Por que?**
Um alias `type X = Y` sem diferença de shape não adiciona informação. Pior: cria
a impressão de que `CollarListItem` e `Collar` são coisas distintas, levando
futuros desenvolvedores a adicionarem campos em um mas não no outro. Se a API
realmente retorna shapes diferentes na lista e no detalhe, o tipo deve refletir
isso com `Omit`/`Pick`.

---

## Angelo — Páginas de acesso e guards de UI

Responsável por `features/access/pages/`, `features/cows/pages/CowDetailPage.tsx`
e `types/access.ts`.

---

### HF-Angelo-01 — `as UserProfile` no estado inicial de `CreateUserModal`

**Arquivo:** `features/access/pages/UsersPage.tsx:69`

**TODO**

```ts
// Antes
const [form, setForm] = useState({
  name: "", email: "", password: "",
  profile: "VIEWER" as UserProfile,
});

// Depois — tipar o estado explicitamente, eliminando o cast
const [form, setForm] = useState<{
  name: string;
  email: string;
  password: string;
  profile: UserProfile;
}>({
  name: "", email: "", password: "", profile: "VIEWER",
});
```

**Por que?**
Sem anotação de tipo no `useState`, TypeScript infere `profile` como `string`
(não `UserProfile`), porque o literal `"VIEWER"` em contexto de objeto não é
estreitado automaticamente. O `as UserProfile` força o tipo mas silencia o
compilador — se `"VIEWER"` fosse digitado errado (`"VIEWR"`), o erro passaria.
Com a anotação explícita no `useState<...>`, o TypeScript verifica que `"VIEWER"`
pertence a `UserProfile` em tempo de compilação.

---

### HF-Angelo-02 — `as UserProfile` em `e.target.value`

**Arquivo:** `features/access/pages/UsersPage.tsx:121` e `:193`

```ts
// Antes
setForm({ ...form, profile: e.target.value as UserProfile })

// Depois — type guard explícito
const { UserProfileValues } = await import("../../../types/access");
// ou importar no topo do arquivo:

function isUserProfile(value: string): value is UserProfile {
  return Object.values(UserProfileValues).includes(value as UserProfile);
}

// no handler:
const value = e.target.value;
if (isUserProfile(value)) {
  setForm({ ...form, profile: value });
}
```

**Por que?**
`e.target.value` é sempre `string` — o TypeScript nunca consegue garantir que o
valor de um `<select>` HTML corresponde a um union type. O `as` diz ao compilador
"confie em mim", mas se o HTML for alterado e um `<option value="SUPERADMIN">`
for adicionado por engano, o bug vai até o banco de dados sem nenhum erro de
compilação.

O type guard `isUserProfile` valida em runtime que o valor pertence ao conjunto
esperado — é a única forma correta de estreitar um `string` para um union type
literal.

> Nota: quando Renato implementar validação Zod no backend (card #12), o
> frontend poderá reusar o schema Zod do `UserProfile` aqui via `.safeParse()`,
> eliminando a necessidade do guard manual.

---

### HF-Angelo-03 — `as UserProfile` no estado inicial de `EditUserModal`

**Arquivo:** `features/access/pages/UsersPage.tsx:150`

```ts
// Antes
profile: (user?.profile ?? "VIEWER") as UserProfile,

// Depois — satisfies
profile: (user?.profile ?? "VIEWER") satisfies UserProfile,
```

**Por que?**
`user` vem do React Query, portanto `user?.profile` já é `UserProfile | undefined`
pelo tipo da API. O `?? "VIEWER"` garante um fallback, resultado final é
`UserProfile`. O compilador, porém, não confirma isso sozinho. `satisfies`
verifica a compatibilidade sem fazer cast — se `user.profile` vier com um valor
fora do union, o erro aparece em compilação. `as` teria aceitado em silêncio.

---

### HF-Angelo-04 — `!` em callbacks do `ConfirmDialog`

**Arquivos:**
- `UsersPage.tsx:615` — `editingUser!.id`
- `UsersPage.tsx:635` — `togglingUser!.id`
- `UsersPage.tsx:649` — `deletingUser!.id`
- `RolesPage.tsx:480` — `deletingRole!.id`
- `PermissionsPage.tsx:275` — `deletingPerm!.id`

**Padrão atual (todos seguem o mesmo padrão):**

```tsx
<ConfirmDialog
  open={!!deletingRole}
  onConfirm={() =>
    deleteRole(String(deletingRole!.id), {   // <-- !
      onSuccess: () => setDeletingRole(null),
    })
  }
/>
```

**TODO — guard explícito no início do callback:**

```tsx
<ConfirmDialog
  open={!!deletingRole}
  onConfirm={() => {
    if (!deletingRole) return;               // <-- guard
    deleteRole(String(deletingRole.id), {
      onSuccess: () => setDeletingRole(null),
    });
  }}
/>
```

**Por que?**
O `!!deletingRole` na prop `open` garante logicamente que quando `onConfirm`
é chamado, `deletingRole` não é `null` — mas o TypeScript não rastreia essa
correlação entre props. O `!` suprime o erro sem explicar o raciocínio.

O `if (!deletingRole) return` documenta a invariante explicitamente: "se de
alguma forma chegarmos aqui sem um role selecionado, abortamos". Isso protege
contra futuros refactors que possam quebrar a correlação `open ↔ state`.

---

### HF-Angelo-05 — `!` em `CowDetailPage` para `cow.collar`

**Arquivo:** `features/cows/pages/CowDetailPage.tsx:176`

```tsx
// Contexto — o botão está dentro de {cow.collar && (...)}
{cow.collar && (
  <button onClick={() => navigate(`/collars/${cow.collar!.id}`)}>
    {cow.collar.name}
  </button>
)}

// Depois — o outer guard já garante collar != null; remover !
{cow.collar && (
  <button onClick={() => navigate(`/collars/${cow.collar.id}`)}>
    {cow.collar.name}
  </button>
)}
```

**Por que?**
O bloco `{cow.collar && (...)}` já faz narrowing de `cow.collar` para não-nulo
dentro do JSX. O `cow.collar.name` na linha seguinte não usa `!` e o TypeScript
aceita — evidência de que o narrowing funciona. O `!` na linha 176 é
inconsistente e desnecessário. Provavelmente foi adicionado sem perceber que o
narrowing já se aplicava.

---

### HF-Angelo-06 — `UserListItem` redefinido manualmente

**Arquivo:** `types/access.ts:57-63`

```ts
// Antes — campos copiados manualmente de User
export interface UserListItem {
  id: string;
  name: string;
  email: string;
  profile: UserProfile;
  isActive: boolean;
}

// Depois — extraído de User
export type UserListItem = Pick<User, "id" | "name" | "email" | "profile" | "isActive">;
```

**Por que?**
Se `User` ganhar um novo campo obrigatório ou um campo existente for renomeado,
a interface `UserListItem` não é atualizada automaticamente — os tipos divergem
silenciosamente. Com `Pick<User, ...>`, qualquer mudança em `User` propaga
automaticamente, e o compilador avisa se um campo listado no `Pick` deixar de
existir em `User`.

---

### HF-Angelo-07 — `Array<T>` em `types/access.ts`

**Arquivo:** `types/access.ts:50-51, 88`

```ts
// Antes
roles: RoleListItem[];
permissions: Permission[];

// Depois
roles: Array<RoleListItem>;
permissions: Array<Permission>;
```

Mesmo racional do HF-01 — consistência com o guia do projeto.

---

## Ordem sugerida de execução

### JCFS

| # | Hotfix | Impacto | Risco |
|---|--------|---------|-------|
| 1 | HF-05 — Resolver `AuthUser` duplicado | Alto | Médio — requer verificar imports |
| 2 | HF-02 — Renomear constantes para UPPER_SNAKE_CASE | Médio | Baixo — busca e substitui |
| 3 | HF-03 — Prefixo `T` em `SensorPage<TData>` | Baixo | Baixo |
| 4 | HF-04 — `as Cow \| undefined` no MapPage | Baixo | Zero |
| 5 | HF-01 — `Array<T>` nos tipos | Baixo | Zero |
| 6 | HF-06 — `CollarListItem` alias trivial | Baixo | Zero |

### Angelo

| # | Hotfix | Impacto | Risco |
|---|--------|---------|-------|
| 1 | HF-Angelo-04 — `!` nos ConfirmDialogs | Alto | Baixo |
| 2 | HF-Angelo-05 — `!` em CowDetailPage | Alto | Zero |
| 3 | HF-Angelo-01 — `as UserProfile` no estado inicial | Médio | Baixo |
| 4 | HF-Angelo-02 — `as UserProfile` em `e.target.value` | Médio | Baixo |
| 5 | HF-Angelo-03 — `as UserProfile` com `satisfies` | Médio | Zero |
| 6 | HF-Angelo-06 — `UserListItem` como `Pick<User>` | Baixo | Baixo |
| 7 | HF-Angelo-07 — `Array<T>` em access.ts | Baixo | Zero |

---

## Verificação após cada hotfix

```bash
cd frontend && npm run build
```

Zero erros de TypeScript antes de commitar qualquer hotfix.
