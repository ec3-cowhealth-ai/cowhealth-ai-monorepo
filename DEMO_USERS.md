# Usuários de Demonstração — CowHealth AI

Todos os usuários abaixo são **dados mockados** gerados pelo seed do banco.
Senha padrão de todos os usuários: **`12345678`**

---

## Super Admin

| Campo | Valor |
|---|---|
| **E-mail** | `admin@cowhealth.com` |
| **Senha** | `12345678` |
| **Papel** | SuperAdmin |
| **Acesso** | Irrestrito — todas as fazendas, todas as permissões |

---

## Administradores de Fazenda

Cada administrador acessa exclusivamente a sua fazenda.

| E-mail | Senha | Fazenda |
|---|---|---|
| `administrador@aurora.com` | `12345678` | Fazenda Aurora (Curitiba, PR) |
| `administrador@saobento.com` | `12345678` | Fazenda Sao Bento (Londrina, PR) |
| `administrador@boaesperanca.com` | `12345678` | Fazenda Boa Esperanca (Maringa, PR) |
| `administrador@santaclara.com` | `12345678` | Fazenda Santa Clara (Ponta Grossa, PR) |
| `administrador@valeverde.com` | `12345678` | Fazenda Vale Verde (Cascavel, PR) |

---

## Perfis Especializados

| E-mail | Senha | Papel | Fazendas com acesso | Permissões relevantes |
|---|---|---|---|---|
| `vet@cowhealth.com` | `12345678` | Veterinário | Aurora, Sao Bento | Visualizar e editar vacas, prontuários médicos e clínicos, notificações |
| `zoot@cowhealth.com` | `12345678` | Zootecnista | Boa Esperanca | Visualizar e editar vacas, visualizar prontuários, notificações |
| `gerente@cowhealth.com` | `12345678` | Gerente de Fazenda | Aurora | Criar e editar vacas, aposentar animal, visualizar prontuários, notificações |
| `operador@cowhealth.com` | `12345678` | Operador de Campo | Aurora | Visualizar fazendas e vacas, notificações |
| `financeiro@cowhealth.com` | `12345678` | Financeiro | Todas (5 fazendas) | Visualizar fazendas, vacas e colares (somente leitura) |
| `obs@cowhealth.com` | `12345678` | Observador | Santa Clara | Visualizar fazendas e vacas, notificações (somente leitura) |

---

## Resumo de permissões por papel

| Papel | Fazendas | Colares | Vacas | Prontuário médico | Prontuário clínico | Usuários / Papéis / Permissões |
|---|---|---|---|---|---|---|
| SuperAdmin | ✅ total | ✅ total | ✅ total | ✅ total | ✅ total | ✅ total |
| Administrador | ✅ total | ✅ total | ✅ total | ✅ total | ✅ total | ✅ (exceto permissões) |
| Veterinário | 👁 leitura | 👁 leitura | ✅ total | ✅ total | ✅ total | — |
| Zootecnista | 👁 leitura | 👁 leitura | ✅ total | 👁 leitura | 👁 leitura | — |
| Gerente de Fazenda | 👁 leitura | 👁 leitura | ✅ criar/editar/aposentar | 👁 leitura | 👁 leitura | — |
| Operador de Campo | 👁 leitura | — | 👁 leitura | — | — | — |
| Financeiro | 👁 leitura | 👁 leitura | 👁 leitura | — | — | — |
| Observador | 👁 leitura | — | 👁 leitura | — | — | — |

---

## Fazendas cadastradas

| # | Nome | Cidade | Estado | Latitude | Longitude |
|---|---|---|---|---|---|
| 1 | Fazenda Santa Clara | Ponta Grossa | PR | -25.0945 | -50.1633 |
| 2 | Fazenda Aurora | Curitiba | PR | -14.0658 | -50.4153 |
| 3 | Fazenda Vale Verde | Cascavel | PR | -24.9578 | -53.4554 |
| 4 | Fazenda Sao Bento | Londrina | PR | -14.9375 | -51.0800 |
| 5 | Fazenda Boa Esperanca | Maringa | PR | -12.9167 | -52.4167 |

---

## Dados no banco (seed)

| Entidade | Quantidade |
|---|---|
| Fazendas | 5 |
| Vacas | 160 (32 por fazenda) |
| Colares | 200 (160 ativos + 40 em estoque/manutenção/bateria) |
| Distribuição de status | ~69% saudáveis · ~12% estresse térmico · ~12% alerta · ~6% parição |
| Histórico de sensores | 1 semana por vaca (FC, temperatura, acelerômetro) |
| Prontuários médicos | ~2–3 por vaca |
| Prontuários clínicos | ~2–3 por vaca |
| Eventos de atividade | 3–5 por vaca |
