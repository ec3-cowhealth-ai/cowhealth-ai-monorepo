# CowHealth AI

[![Repository](https://img.shields.io/badge/repositório-monorepo-2B2C28?style=for-the-badge)](./)
[![Platform](https://img.shields.io/badge/plataforma-web-339989?style=for-the-badge)](./)
[![Language](https://img.shields.io/badge/idioma-Português%20BR-E8C66B?style=for-the-badge)](./)

> **Saiba antes. Aja mais rápido. Proteja cada vaca.**

CowHealth AI é uma plataforma de monitoramento de saúde bovina de precisão para fazendas leiteiras. Cada vaca usa uma coleira inteligente que transmite dados fisiológicos e comportamentais continuamente — frequência cardíaca, temperatura corporal e movimentação. Esses dados alimentam um motor de análise que detecta condições críticas em tempo real e gera alertas acionáveis para produtores e veterinários, antes que pequenos sinais virem grandes problemas.

---

## Como funciona

```
Coleira RF10A (IoT)
  │  temperatura · frequência cardíaca · acelerômetro · giroscópio · GPS
  │  transmissão via Wi-Fi / MQTT
  ▼
Backend (Express + Prisma)
  │  ingestão de dados → cowHealthAnalyzer → classifica condição
  │  dispara notificação com severidade (HIGH / MEDIUM / LOW)
  ▼
Dashboard Web (React)
  ├── Produtor rural → visão do rebanho, alertas, mapa GPS
  └── Veterinário   → prontuário clínico, histórico, plano de tratamento
```

---

## A coleira inteligente

A coleira RF10A é o sensor central do sistema. Robusta e projetada para condições reais de fazenda, transmite dados continuamente via MQTT para o backend — com frequência ajustável por dispositivo (a cada 2, 10 ou 60 minutos).

**Sensores integrados:**

| Sensor | Dados coletados |
|---|---|
| Infravermelho | Temperatura corporal (°C) |
| Fotopletismografia | Frequência cardíaca (BPM) e SpO₂ |
| Acelerômetro (3 eixos) | Movimentação, postura, agitação |
| Giroscópio (3 eixos) | Assimetria de marcha, detecção de claudicação |
| GPS | Posição geográfica (latitude / longitude) |

Processamento na borda (edge), arquitetura tolerante a falhas de conexão e invólucro testado em campo.

---

## Motor de diagnóstico heurístico

O `cowHealthAnalyzer` é um classificador puro que recebe um snapshot de sensores de uma vaca e determina se ela apresenta alguma condição de saúde. Não há LLM — as regras são heurísticas baseadas em limiares fisiológicos documentados no **Anexo VII**.

**8 condições definidas no modelo:**

| Condição | Sinais monitorados |
|---|---|
| **Parto iminente** (CALVING) | Mudanças posturais frequentes + FC elevada + queda de temperatura |
| **Estresse térmico** (HEAT_STRESS) | Temperatura média alta + FC elevada + picos de agitação |
| **Doença respiratória bovina** (BRD) | Temperatura alta + FC alta + SpO₂ baixo + baixa atividade |
| **Mastite sistêmica** (MASTITIS) | Temperatura alta + FC elevada + postura anormal prolongada |
| **Cetose** (KETOSIS) | Alta variabilidade da FC + baixa atividade + temperatura abaixo do normal |
| **Claudicação** (LAMENESS) | Assimetria de marcha (giroscópio) + postura incomum + FC elevada |
| **Desidratação / Choque** (SHOCK) | SpO₂ crítico + FC muito alta + temperatura periférica baixa + letargia |
| **Risco escalado** (AT_RISK) | Score ponderado — combina múltiplos sintomas parciais |

Hoje **CALVING** e **HEAT_STRESS** estão implementados. Os demais estão modelados em `docs/heuristic_models/` e planejados para a próxima fase.

---

## Funcionalidades

### Para o produtor rural

- **Dashboard** com KPIs do rebanho por fazenda: total de vacas, distribuição por status de saúde, alertas ativos
- **Feed de alertas** em tempo real com severidade (alta / média / baixa) e tipo de evento
- **Mapa GPS** interativo com posição de cada vaca no pasto (Leaflet)
- **Lista de vacas** com status visual de saúde, filtros e busca
- **Ficha individual** da vaca: raça, peso, data de nascimento, galeria de fotos, histórico de sensor (FC, temperatura, acelerômetro em gráficos)
- **Status reprodutivo**: gestante, inseminada, seca, pós-parto — com datas de parto e número de lactação
- **Linha do tempo de atividade**: ruminação, alimentação, descanso, alta/baixa atividade, caminhada
- **Gestão de coleiras**: vincular, desvincular, ajustar frequência de transmissão, monitorar bateria e status

### Para o veterinário

- **Prontuário clínico completo** (`CowClinicalRecord`): avaliação gerada a partir de um alerta ou visita agendada, registra:
  - Sinais vitais medidos na consulta (FC, SpO₂, temperatura corporal e ambiente)
  - Biometria (peso, escore de condição corporal)
  - Histórico de saúde, sintomas atuais, diagnóstico e plano de tratamento
  - Medicamentos administrados, vacinações, procedimentos cirúrgicos e alergias
  - Snapshot reprodutivo da consulta (status, elegibilidade, janela de inseminação, gestação)
  - Recomendações veterinárias e agendamento de retorno
- **Registros médicos** por evento: checkup, procedimento, medicação
- **Solicitação de veterinário** diretamente pela fazenda

### Para o administrador

- **Gestão de fazendas**: cadastro com CNPJ, endereço e geolocalização
- **Gestão de usuários**: criar, editar, ativar/desativar, associar a fazendas
- **RBAC completo**: papéis (roles), permissões granulares e grupos de permissões — tudo configurável pela interface

---

## Landing page

O sistema inclui um site público de apresentação em `/landing`, com seções de produto, problema, solução, demonstração da coleira, diferenciais e chamada para piloto. Separado do app autenticado.

---

## Referência técnica

Stack, estrutura de pastas, design system, modelo de dados, setup local e mapa de documentação estão em:

**[TECHNICAL.md](./TECHNICAL.md)**
