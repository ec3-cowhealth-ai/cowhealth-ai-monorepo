# MANAGER — Agente de Gestão & Conformidade

> **Autoridade de qualidade** do CowHealth AI. Define checkpoints, validações obrigatórias e critérios de aceição para código, design e documentação.

**Status:** Ativo
**Autoridade:** Tier 1 (Source of Truth)
**Última atualização:** 2026-05-12
**Propriedário:** Jcfs (Arquitetura)

---

## 1. Propósito

Garantir que **todo código, design e documentação** entregues respeitem os padrões definidos em:

1. [agents/agents.md](./agents/agents.md) — Princípios de engenharia
2. [agents/design.md](./agents/design.md) — Sistema de design visual
3. [agents/UIUX_prompt.md](./agents/UIUX_prompt.md) — Geração de mockups

**Ninguém passa.**

---

## 2. Fluxo de Conformidade

```
┌─────────────────────────────────────────────────────┐
│ Desenvolvedor começa feature                         │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
         ┌──────────────────────┐
         │ Lê START_HERE.md      │
         │ ↓ depois MANAGER.md   │
         │ ↓ depois agents.md    │
         └──────────────────────┘
                 │
                 ▼
      ┌──────────────────────────┐
      │ Implementa feature        │
      │ (segue agents.md)         │
      │ (segue design.md)         │
      │ (atualiza /docs/*)       │
      └──────┬───────────────────┘
             │
             ▼
    ┌────────────────────────┐
    │ Roda verificações:     │
    │ • lint                 │
    │ • typecheck            │
    │ • test                 │
    │ • build                │
    │ • (passa no MANAGER    │
    │   checklist abaixo)   │
    └────┬───────────────────┘
         │
         ▼
    ┌─────────────┐
    │ Cria PR     │
    │ Com descr.  │
    └──────┬──────┘
           │
           ▼
    ┌──────────────────────────┐
    │ Code Review              │
    │ (MANAGER checklist)       │
    │ ↓ Aprovado               │
    │ ↓ Merge & deploy         │
    └──────────────────────────┘
```

---

## 3. Checklist Pré-PR (Desenvolvedor)

Antes de criar Pull Request, o desenvolvedor **DEVE** validar:

### 3.1 Conformidade com agents.md

- [ ] **Repository Grounding** — Li os arquivos de contexto do projeto antes de codificar?
- [ ] **Arquitetura** — O código segue a arquitetura definida em `agents/agents.md:16`?
- [ ] **Naming** — Componentes React em PascalCase, funções em camelCase? (agents.md:1084–1085)
- [ ] **TypeScript** — Sem `any`, tipos explícitos, strict mode? (agents.md:1087–1094)
- [ ] **React Patterns** — Função components, hooks corretamente, sem side effects escondidos? (agents.md:1116–1139)
- [ ] **Testes** — Incluí testes unitários/de componente para lógica não-trivial? (agents.md:1471–1497)
- [ ] **Documentação** — Atualizei `/docs/plan.md`, `/docs/tasks.md`, `/docs/design.md`? (agents.md:270–279)

### 3.2 Conformidade com design.md

- [ ] **Paleta de cores** — Uso apenas tokens definidos em `agents/design.md:23–88`?
- [ ] **Tipografia** — Uso Space Grotesk / Manrope / JetBrains Mono? (design.md:110–127)
- [ ] **Espaçamento** — Grid 4px, escalas s-1 até s-9? (design.md:152–177)
- [ ] **Componentes** — Botões, inputs, cards usam padrões definidos? (design.md:225–299)
- [ ] **Acessibilidade** — Contraste WCAG AA, tap targets ≥48px, sem hover-only? (design.md:100–107, agents.md:1217–1236)
- [ ] **Estados** — Loading (skeleton, não spinner), erro, offline cobertos? (design.md:331–343)

### 3.3 Conformidade com UIUX_prompt.md

- [ ] **Se há novas telas:** Geradora via UIUX_prompt.md ou aprovada manualmente?
- [ ] **Mockups** — Incluem dados realistas PT-BR, safe areas, status bar?
- [ ] **Navegação** — ≤3 cliques para qualquer dado? (design.md:18)

### 3.4 Build & Verification

- [ ] `npm run lint` passa sem erros
- [ ] `npm run typecheck` passa sem erros
- [ ] `npm run test` passa (ou justifica skip com evidência)
- [ ] `npm run build` gera production bundle sem warnings críticos
- [ ] Testei localmente em modo dev e preview (production build)

---

## 4. Checklist Code Review (Revisor/Gestor)

Ao revisar PR, usar este checklist. Use severidade:

- **🔴 BLOCKER** — Viola agents.md ou design.md. **Não mergeía.**
- **🟡 MAJOR** — Risco de qualidade, performance, acessibilidade ou segurança.
- **🟢 MINOR** — Melhoria sugerida.
- **⚪ NIT** — Style, comentário trivial.

### 4.1 Conformidade (agents.md)

| Critério              | Checklist                                                                     | Severidade |
| --------------------- | ----------------------------------------------------------------------------- | ---------- |
| **Arquitetura**       | Segue padrão do projeto (feature-based ou domain-centric)? Acoplamento baixo? | 🔴         |
| **Naming**            | Componentes/funções/arquivos com nomes claros e convenções?                   | 🟡         |
| **TypeScript**        | Sem `any` não-documentado? Tipos explícitos?                                  | 🔴         |
| **React**             | Function components? Hooks corretos? Deps arrays? No stale closures?          | 🔴         |
| **Testes**            | Unidade + componente quando relevante? Cobertura para lógica crítica?         | 🟡         |
| **Async/Concurrency** | Promises tratadas? Race conditions evitadas?                                  | 🔴         |
| **Segurança**         | Sem hardcoded secrets? Inputs validados? dangerouslySetInnerHTML evitado?     | 🔴         |
| **Docs**              | /docs/plan.md, /docs/design.md, /docs/tasks.md atualizados?                   | 🟡         |
| **UML**               | Se arquitetura/design muda, UML incluído?                                     | 🟡         |

### 4.2 Conformidade (design.md)

| Critério           | Checklist                                                                 | Severidade |
| ------------------ | ------------------------------------------------------------------------- | ---------- |
| **Cores**          | Usa tokens do design.md? Sem hardcoded hex?                               | 🔴         |
| **Tipografia**     | Space Grotesk / Manrope / JetBrains Mono? Escala respeitada?              | 🔴         |
| **Espaçamento**    | Grid 4px? Escalas s-1…s-9? Consistente?                                   | 🟡         |
| **Componentes**    | Botões, inputs, cards seguem padrões?                                     | 🔴         |
| **Acessibilidade** | WCAG AA mínimo? Tap targets ≥48px? Focus states?                          | 🔴         |
| **Estados**        | Loading = skeleton (não spinner anônimo)? Erro + ação? Offline declarado? | 🟡         |
| **Responsividade** | Mobile-first? Safe areas (notch + home indicator)?                        | 🟡         |

### 4.3 Build & Verification

| Criterio      | Checklist                                      | Severidade |
| ------------- | ---------------------------------------------- | ---------- |
| **Lint**      | npm run lint passa?                            | 🔴         |
| **TypeCheck** | npm run typecheck passa?                       | 🔴         |
| **Testes**    | npm run test passa? Ou skip com justificativa? | 🟡         |
| **Build**     | npm run build sem warnings críticos?           | 🔴         |

### 4.4 Documentação

| Critério               | Checklist                             | Severidade |
| ---------------------- | ------------------------------------- | ---------- |
| **PR Description**     | Explica o quê, por quê, como testar?  | 🟡         |
| **Arquivos alterados** | Lista clara + evidências em /docs/\*? | 🟢         |
| **ADR (se needed)**    | Decisão arquitetural documentada?     | 🟡         |

---

## 5. Critérios de Aceição (Definition of Done)

Uma feature está **pronta para merge** quando:

1. ✅ Passou em **todos** os checklist acima (nenhum 🔴 aberto)
2. ✅ Código **compilável e testável** localmente
3. ✅ **Documentação atualizada** em `/docs`
4. ✅ **Menos de 3 commits** (ou history limpo)
5. ✅ **Nenhum conflict** com `main`
6. ✅ **Aprovado por pelo menos 1 revisor**

---

## 6. Validação de Features por Domínio

### 6.1 Novas Telas UI

**Deve passar:**

- ✅ Design visual conforme `agents/design.md`
- ✅ Mockup gerado ou aprovado manualmente
- ✅ Acessibilidade (contrast, focus, labels)
- ✅ 3 clicks rule (navegação rápida)
- ✅ Estados cobertos (loading, empty, error, offline)

### 6.2 Novas Rotas / Navegação

**Deve passar:**

- ✅ Documentada em `/docs/design.md` (seção "Route Architecture")
- ✅ UML de navegação atualizado
- ✅ Lazy loading considerado
- ✅ Sem nesting excessivo

### 6.3 Integração com API

**Deve passar:**

- ✅ Contrato da API documentado (`/docs/design.md` seção "API Integration")
- ✅ Trata 3 estados: loading, success, error
- ✅ Retry logic ou timeout se relevante
- ✅ DTO mapping explícito (não expõe API raw)
- ✅ Sem race conditions

### 6.4 Novo Componente Reutilizável

**Deve passar:**

- ✅ Arquivo único em `src/shared/components/`
- ✅ Props bem tipadas (TypeScript)
- ✅ Story ou exemplo de uso
- ✅ Testes de comportamento (React Testing Library)
- ✅ Documentado em `/docs/design.md`

### 6.5 Formulário

**Deve passar:**

- ✅ Validação client + server
- ✅ Preserva input em erro
- ✅ Evita duplicate submission
- ✅ Mensagens de erro associadas ao campo
- ✅ Estados: idle, validating, submitting, success, error

---

## 7. Gatilhos de Revisão Obrigatória

Sempre chamar revisor expert quando:

| Cenário                      | Revisor | Por quê                           |
| ---------------------------- | ------- | --------------------------------- |
| **Nova rota / navegação**    | Jcfs    | Impacta arquitetura               |
| **Novo estado global**       | Jcfs    | Acoplamento, escalabilidade       |
| **Integração com API**       | Jcfs    | Contrato, segurança               |
| **Novo design / componente** | Ian     | Brand consistency, acessibilidade |
| **Refator significativo**    | Jcfs    | Risco de regressão                |
| **Mudança em /docs**         | Jcfs    | Manter docs coerentes             |

---

## 8. Escalação & Conflitos

**Cenário:** Desenvolvedor discorda do checklist ou acha que regra é excessiva.

1. Documenta objeção em PR comment (público)
2. Abre discussão com proprietário (Jcfs)
3. Se mudança de regra é válida → **atualiza MANAGER.md e agents.md**
4. Continua PR ou reabre conforme decisão

**Ninguém mergeaí sem resolução.** Mas também ninguém vai preso por burocratia sem razão.

---

## 9. Manutenção e Evolução

### 9.1 Quando Atualizar

- Após sprint planning (novos padrões descobertos)
- Quando `agents.md` muda
- Quando `design.md` cresce
- Quando problema recorrente aparece em código

### 9.2 Como Atualizar

1. Edita MANAGER.md
2. Abre PR com mudança
3. Aprova com Jcfs
4. Mergeaí e comunica time

---

## 10. Referência Rápida

```markdown
## Quando você começar uma feature:

1. git checkout -b seu-nome/feature
2. Lê START_HERE.md
3. Lê agents/agents.md (seção relevante)
4. Lê agents/design.md (se UI)
5. Implementa
6. Roda: lint → typecheck → test → build
7. Valida contra MANAGER.md checklist (seção 3.1–3.4)
8. PR com descrição clara
9. Aguarda review (contra MANAGER.md seção 4)

## Quando você revisar uma PR:

1. Lê PR description
2. Clona + roda `npm install && npm run lint && npm run typecheck && npm run test && npm run build`
3. Valida contra MANAGER.md seção 4 (severidade 🔴 é blocker)
4. Commenta específico (não "isso tá feio", mas "isso viola design.md:250 porque…")
5. Aprova ou pede ajustes
6. Mergeaí quando tudo ✅
```

---

## 11. Links de Referência

- **[START_HERE.md](./START_HERE.md)** — Entrada do projeto
- **[agents/agents.md](./agents/agents.md)** — Princípios de engenharia (rules 1–45)
- **[agents/design.md](./agents/design.md)** — Sistema de design visual (seções 1–15)
- **[agents/UIUX_prompt.md](./agents/UIUX_prompt.md)** — Prompt para mockups
- **[/docs/design.md](./docs/design.md)** — Design do projeto (UML, rotas, APIs)

---

## 12. Changelog

| Data       | Mudança           | Por quê                                        |
| ---------- | ----------------- | ---------------------------------------------- |
| 2026-05-12 | Criado MANAGER.md | Necessário meta-agent para gestão de qualidade |

---

**Última palavra:** Regras existem para proteger qualidade a longo prazo, não para chocar. Se uma regra não faz sentido → levanta com Jcfs. Mas enquanto estiver aqui, ela vale.
