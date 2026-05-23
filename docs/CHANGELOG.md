Todas as mudanças notáveis deste projeto estão documentadas em `/docs/change_control/CHANGELOG.md`.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## Como registrar suas mudanças

> Leia antes de escrever no CHANGELOG. Registros mal feitos geram retrabalho e conflitos de merge.

### Regras obrigatórias

1. **Escreva para humanos, não para máquinas.**
   O CHANGELOG não é log de commit. Explique o impacto da mudança, não o que você digitou.

2. **Uma seção por desenvolvedor por data.**
   Use o cabeçalho `## YYYY-MM-DD - Descrição resumida (NOME)` e agrupe tudo que fez naquele dia em uma única entrada.

3. **Classifique cada mudança em uma das 6 categorias.**
4. **Use datas no formato ISO 8601: `YYYY-MM-DD`.** Correto: `2026-05-23`. Errado: `23/05/26`, `May 23`, `hoje`.
5. **Mantenha o mais recente no topo.** Novas entradas sempre acima das anteriores dentro da sua seção.
6. **Não copie mensagens de commit.** `fix typo`, `wip`, `ajustes` não dizem nada. Descreva o que mudou e por quê importa.

#### As 6 categorias válidas

- `### Adicionado` — Nova funcionalidade, arquivo, rota, componente
- `### Modificado` — Alteração em algo que já existia
- `### Depreciado` — Algo que ainda funciona mas será removido em breve
- `### Removido` — Funcionalidade, arquivo ou rota eliminados
- `### Corrigido` — Correção de bug
- `### Segurança` — Correção de vulnerabilidade

### Boas práticas

- Liste arquivos criados, modificados e removidos explicitamente.
- Se corrigiu um bug, descreva a causa e a solução — não só o sintoma.
- Se a mudança afeta outro membro do time (ex: contrato de API, tipo TypeScript, variável de ambiente), destaque em negrito ou com nota.
- Status de build ao final da entrada é bem-vindo: `✅ TypeScript: zero erros`.

### O que evitar

- Não use git diff ou git log como substituto do CHANGELOG.
- Não omita remoções — são as mudanças que mais quebram o trabalho alheio.
- Não misture datas diferentes na mesma entrada.
- Não escreva em primeira pessoa excessiva (`eu fiz`, `eu corrigi`) — o nome no cabeçalho já identifica o autor.