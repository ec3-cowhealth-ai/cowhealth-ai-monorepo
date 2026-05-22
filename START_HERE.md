# CowHealth AI — Start Here

> Bem-vindo ao repositório do **CowHealth AI**, uma aplicação mobile para monitoramento contínuo de saúde bovina via coleira inteligente.

---

## 📌 Antes de tudo

Você é novo por aqui? Leia nesta ordem:

1. **[MANAGER.md](./MANAGER.md)** — Padrões de qualidade e conformidade obrigatórios
2. **[agents/agents.md](./agents/agents.md)** — Princípios de engenharia e arquitetura
3. **[agents/design.md](./agents/design.md)** — Sistema de design visual (cores, tipografia, componentes)
4. **[agents/UIUX_prompt.md](./agents/UIUX_prompt.md)** — Como gerar mockups high-fidelity
5. **[docs/CHANGELOG.md](./docs/CHANGELOG.md)**Todas as mudanças notáveis deste projeto estão documentadas aqui.
   Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## 🎯 Projeto

**O que é:** App iOS/Android para veterinários e produtores rurais monitorarem saúde bovina em tempo real via sensores.

**Status:** Frontend em desenvolvimento (React + Vite + TypeScript)

**Público:** Produtor rural, veterinário, gestor de rebanho

**Plataforma:** iOS & Android

---

## 🛠️ Tech Stack

- **React 18** (function components, hooks)
- **Vite** (bundler e dev server)
- **TypeScript** (strict mode)
- **Tailwind CSS** ou CSS Modules (conforme agents/design.md)
- **Vitest** + React Testing Library (testes)
- **ESLint + Prettier** (qualidade de código)

---

## 📂 Estrutura do Repositório

```
cowhealth-new/
├── START_HERE.md           ← você está aqui
├── MANAGER.md              ← padrões de qualidade & validação
├── agents/
│   ├── agents.md           ← princípios de engenharia
│   ├── design.md           ← sistema de design visual
│   └── UIUX_prompt.md      ← prompt para gerar mockups
├── src/                    ← código-fonte
├── docs/                   ← documentação (planos, design, tasks, memory)
├── public/                 ← assets estáticos
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🚀 Como rodar localmente

### Setup inicial

```bash
npm install
npm run dev
```

Acessa [http://localhost:5173](http://localhost:5173)

### Verificação de qualidade

```bash
npm run lint       # ESLint + Prettier check
npm run typecheck  # TypeScript type checking
npm run test       # Vitest
npm run build      # Build production
```

---

## 📋 Como trabalhar

1. **Antes de codificar:**
   - Cria branch localmente: `git checkout -b seu-nome/feature-name`
   - Lê [MANAGER.md](./MANAGER.md) para checkpoints obrigatórios

2. **Durante desenvolvimento:**
   - Segue [agents/agents.md](./agents/agents.md) para arquitetura e padrões
   - Segue [agents/design.md](./agents/design.md) para UI/UX
   - Atualize `/docs/plan.md`, `/docs/design.md`, `/docs/tasks.md` conforme necessário

3. **Antes de PR:**
   - Rode `npm run lint && npm run typecheck && npm run test && npm run build`
   - Valide contra checklist do [MANAGER.md](./MANAGER.md)
   - Cria PR com descrição clara

---

## 📚 Documentação

### Documentação de projeto (sempre atualizada)

- `/docs/plan.md` — Objetivo, escopo, riscos, aceitação
- `/docs/tasks.md` — Work items e progresso
- `/docs/design.md` — Arquitetura, componentes, UML, decisões
- `/docs/memory.md` — Decisões aprovadas, preferências, contexto durable

### Documentação de sistema

- **[agents/agents.md](./agents/agents.md)** — Full guide de princípios e padrões
- **[agents/design.md](./agents/design.md)** — Design tokens, componentes, padrões visuais
- **[agents/UIUX_prompt.md](./agents/UIUX_prompt.md)** — Geração de mockups high-fidelity

---

## 👤 Times e Ownership

| Função | Responsável |
|--------|------------|
| Arquitetura & Backend | Jcfs |
| Frontend & Design | Ian |
| QA / Validação | (a definir) |

---

## ❓ Perguntas frequentes

**P: Por onde começo se quero implementar uma feature?**
R: Leia [MANAGER.md](./MANAGER.md) seção "Workflow de Feature", depois [agents/agents.md](./agents/agents.md).

**P: Como crio uma nova tela?**
R: Siga [agents/design.md](./agents/design.md) para design, depois [agents/UIUX_prompt.md](./agents/UIUX_prompt.md) para mockup.

**P: Posso adicionar uma nova dependência?**
R: Não sem validação. Leia [agents/agents.md](./agents/agents.md) seção "Rule 11: Web Technology Defaults".

**P: Como faço code review?**
R: Use o checklist do [MANAGER.md](./MANAGER.md).

---

## 🔗 Links úteis

- **Figma** (design) — [link a ser preenchido]
- **Jira** (sprints) — [link a ser preenchido]
- **GitHub** (PRs) — `https://github.com/seu-org/cowhealth`

---

**Última atualização:** 2026-05-12
**Status:** Ativo