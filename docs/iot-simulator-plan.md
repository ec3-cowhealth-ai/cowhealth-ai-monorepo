# CowHealth AI — Plano do Projeto IoT Simulador

> **Status:** Documento de planejamento para execução em repositório separado
> **Data:** 2026-05-22
> **Escopo:** Simulador Python de sensores + bridge MQTT → Banco de dados

---

## 1. Contexto e Objetivo

O sistema CowHealth AI monitora o bem-estar de bovinos via coleiras inteligentes equipadas com três sensores:

| Sensor | Chip | Sinal Vital Capturado |
|--------|------|-----------------------|
| Frequência Cardíaca | MAX30102 | BPM (batimentos por minuto) |
| Temperatura Corporal | MLX90614 | Celsius (temperatura infravermelha) |
| Movimento / Postura | MPU-6050 (IMU) | Acelerômetro (X, Y, Z) + Giroscópio (X, Y, Z) |

O objetivo deste projeto é:
1. Simular **160 vacas** gerando dados de sensores em tempo real
2. Publicar os dados num **broker MQTT** gratuito
3. Um **worker** consome o MQTT e persiste os dados no banco via API REST do backend

---

## 2. Sinais Vitais — Referências Fisiológicas Bovinas

### 2.1 Frequência Cardíaca (MAX30102)

| Estado | Faixa (BPM) |
|--------|-------------|
| Repouso | 40 – 70 |
| Ativo / andando | 60 – 80 |
| Estresse leve | 80 – 100 |
| **Estresse térmico** | **> 100** |
| **Parto iminente** | **> 90** |

### 2.2 Temperatura Corporal (MLX90614 — infravermelho)

| Estado | Faixa (°C) |
|--------|-----------|
| Normal | 38.0 – 39.3 |
| Leve febre | 39.3 – 39.8 |
| **Estresse térmico** | **> 39.0 sustentado** |
| **Pré-parto** (queda) | **Queda > 0.5°C em 12h** |

### 2.3 Acelerômetro / Giroscópio (MPU-6050)

| Eixo | Repouso | Movimentação normal | Agitação |
|------|---------|---------------------|----------|
| accel_X | ~0.0 g | ±0.3 g | Delta > 0.8 g |
| accel_Y | ~0.0 g | ±0.3 g | Delta > 0.8 g |
| accel_Z | ~1.0 g (gravidade) | 0.8 – 1.2 g | Delta > 0.5 g (mudança postural) |
| gyro_X/Y/Z | ~0.0 °/s | ±5 °/s | Picos acima ±20 °/s |

### 2.4 Logica de Deteccao de Alertas (replicada do sistema original)

**Parto Iminente (CALVING):**
- Mudancas posturais (delta accelZ > 0.5) > 10 ocorrencias na ultima hora
- Media de FC (ultimas 30 leituras) > 90 BPM
- Delta de temperatura nas ultimas 12h < 0 (queda de temperatura)

**Estresse Termico (HEAT_STRESS):**
- Temperatura media (ultimas 30 leituras) > 39.0 graus C
- FC media (ultimas 30 leituras) > 100 BPM
- Picos de agitacao (delta accelX > 0.8 ou delta accelY > 0.8) > 15 em 30 minutos

---

## 3. Formato do Payload MQTT

Cada mensagem publicada pelo simulador segue o formato JSON abaixo, **identico ao formato usado pelos colares fisicos**:

```json
{
  "device_id": "1234ABC",
  "datetime": "2026-05-22T14:30:00.000Z",
  "sensors": {
    "max30102": {
      "heart_rate": 68
    },
    "mlx": {
      "object_temp": 38.7
    },
    "mpu": {
      "acc": [0.05, -0.12, 0.98],
      "gyro": [1.2, -0.8, 0.3]
    }
  }
}
```

### Topico MQTT

```
cowhealth/sensors/{device_id}
```

Exemplos:
- `cowhealth/sensors/1234ABC`
- `cowhealth/sensors/0087XYZ`
- `cowhealth/sensors/9921MGT`

O worker assina `cowhealth/sensors/+` (wildcard para todos os colares).

---

## 4. Identificacao das Vacas (device_id)

Formato: **4 digitos numericos + 3 letras maiusculas**

```
Regex: [0-9]{4}[A-Z]{3}
Exemplos: 0001AAA, 0023BKT, 1587ZXP, 9999MGX
```

O `device_id` corresponde ao campo `Collar.name` no banco de dados. O worker usa esse ID para localizar o colar, a vaca e a fazenda, e entao persistir os dados.

---

## 5. Broker MQTT — Recomendacao

### Broker Recomendado: EMQX Public Broker

O projeto original ja usa este broker. E **gratuito, sem cadastro, ideal para desenvolvimento e testes**.

| Atributo | Valor |
|----------|-------|
| Host | `broker.emqx.io` |
| Porta MQTT | `1883` |
| Porta WebSocket | `8083` |
| Porta MQTT TLS | `8883` |
| Autenticacao | Nenhuma (anonimo) |
| Dashboard | https://www.emqx.com/en/mqtt/public-mqtt5-broker |

### Alternativas Gratuitas

| Broker | Host | Observacao |
|--------|------|-----------|
| HiveMQ Public | `broker.hivemq.com:1883` | Alternativa robusta, sem cadastro |
| Mosquitto (self-hosted) | localhost | `pip install mosquitto` ou Docker |
| EMQX Cloud Free | cloud.emqx.com | 1M msgs/mes, requer cadastro |

> **Recomendacao para producao futura:** EMQX Cloud Free Tier ou HiveMQ Cloud (10 conexoes, 10GB/mes gratis).

---

## 6. Arquitetura do Fluxo de Dados

```
+---------------------------------------------------------------+
|              Projeto IoT (repositorio separado)               |
|                                                               |
|  +------------------+  PUBLISH  +-------------------------+  |
|  |  simulator.py    | --------> |  broker.emqx.io:1883    |  |
|  |  160 vacas       |           |  Topico:                |  |
|  |  NNNNLLL IDs     |           |  cowhealth/sensors/{id} |  |
|  |  Intervalos conf.|           +-------------+-----------+  |
|  +------------------+                         |              |
|                                               | SUBSCRIBE    |
|                                               v              |
|                         +---------------------------------+  |
|                         |  worker.py                      |  |
|                         |  1. Recebe mensagem MQTT        |  |
|                         |  2. Valida device_id            |  |
|                         |  3. POST -> API REST do backend |  |
|                         +----------------+----------------+  |
+----------------------------------------------------------+---+
                                           | HTTP POST
                                           v
+--------------------------------------------------------------+
|              cowhealth-ai-monorepo (backend)                 |
|                                                              |
|  POST /mqtt/ingest  (endpoint a criar)                       |
|                                                              |
|  +----------------------------------+                        |
|  |  MySQL (Prisma)                  |                        |
|  |  heart_rate_data                 |                        |
|  |  temperature_data                |                        |
|  |  accelerometer_data              |                        |
|  +----------------------------------+                        |
+--------------------------------------------------------------+
```

---

## 7. Estrutura do Repositorio IoT

```
cowhealth-iot-simulator/
|-- README.md
|-- .env.example
|-- .gitignore
|-- requirements.txt
|
|-- config/
|   `-- settings.py          # Centraliza todas as configs (broker, intervalos, seed)
|
|-- data/
|   `-- collar_ids.json      # Lista dos 160 device_ids gerados (para reuso)
|
|-- simulator/
|   |-- __init__.py
|   |-- cow_state.py         # Modelo de estado de cada vaca (status, tendencias)
|   |-- sensor_generator.py  # Gera valores realistas por estado
|   |-- payload_builder.py   # Monta o JSON final do payload MQTT
|   `-- simulator.py         # Orquestrador principal (loop de publicacao)
|
|-- worker/
|   |-- __init__.py
|   |-- mqtt_consumer.py     # Assina o broker e recebe mensagens
|   |-- api_client.py        # Envia dados para o backend via REST
|   `-- worker.py            # Entry point do worker
|
|-- scripts/
|   |-- generate_collars.py  # Script one-shot: gera os 160 IDs e salva JSON
|   `-- seed_collars_api.py  # Script one-shot: registra colares no backend via API
|
`-- tests/
    |-- test_sensor_generator.py
    `-- test_payload_builder.py
```

---

## 8. Plano Detalhado — Modulos do Simulador

### 8.1 `config/settings.py`

```python
import os
from dotenv import load_dotenv

load_dotenv()

MQTT_BROKER          = os.getenv("MQTT_BROKER", "broker.emqx.io")
MQTT_PORT            = int(os.getenv("MQTT_PORT", 1883))
MQTT_CLIENT_ID_SIM   = os.getenv("MQTT_CLIENT_ID_SIM", "cowhealth-simulator")
MQTT_CLIENT_ID_WORK  = os.getenv("MQTT_CLIENT_ID_WORKER", "cowhealth-worker")
MQTT_TOPIC_PREFIX    = os.getenv("MQTT_TOPIC_PREFIX", "cowhealth/sensors")

SIM_COW_COUNT        = int(os.getenv("SIM_COW_COUNT", 160))
SIM_INTERVAL_SECONDS = int(os.getenv("SIM_INTERVAL_SECONDS", 30))
SIM_BATCH_SIZE       = int(os.getenv("SIM_BATCH_SIZE", 10))
SIM_SEED             = int(os.getenv("SIM_SEED", 42))

BACKEND_URL          = os.getenv("BACKEND_URL", "http://localhost:3001")
MQTT_WORKER_API_KEY  = os.getenv("MQTT_WORKER_API_KEY", "")

LOG_LEVEL            = os.getenv("LOG_LEVEL", "INFO")
```

### 8.2 `scripts/generate_collars.py`

Geracao dos 160 device_ids unicos no formato NNNNLLL:

```python
import random
import string
import json
import os

def generate_device_id(rng: random.Random) -> str:
    numbers = f"{rng.randint(0, 9999):04d}"
    letters = ''.join(rng.choices(string.ascii_uppercase, k=3))
    return f"{numbers}{letters}"

def generate_unique_ids(count: int = 160, seed: int = 42) -> list[str]:
    rng = random.Random(seed)
    ids: set[str] = set()
    while len(ids) < count:
        ids.add(generate_device_id(rng))
    return sorted(ids)

if __name__ == "__main__":
    ids = generate_unique_ids(160, seed=42)
    os.makedirs("data", exist_ok=True)
    with open("data/collar_ids.json", "w") as f:
        json.dump(ids, f, indent=2)
    print(f"Gerados {len(ids)} device_ids salvos em data/collar_ids.json")
```

### 8.3 `simulator/cow_state.py`

Cada vaca mantem estado interno que evolui ao longo do tempo:

```python
from dataclasses import dataclass, field
from enum import Enum
from collections import deque
from datetime import datetime
import random

class CowStatus(Enum):
    HEALTHY     = "HEALTHY"
    HEAT_STRESS = "HEAT_STRESS"
    CALVING     = "CALVING"
    ALERT       = "ALERT"

# Distribuicao inicial de status (soma 1.0)
STATUS_DISTRIBUTION = {
    CowStatus.HEALTHY:     0.80,
    CowStatus.HEAT_STRESS: 0.12,
    CowStatus.CALVING:     0.05,
    CowStatus.ALERT:       0.03,
}

# Probabilidade de transicao por ciclo
TRANSITION_MATRIX = {
    CowStatus.HEALTHY:     {CowStatus.HEAT_STRESS: 0.005, CowStatus.CALVING: 0.002, CowStatus.ALERT: 0.003},
    CowStatus.HEAT_STRESS: {CowStatus.HEALTHY: 0.020},
    CowStatus.CALVING:     {},   # sai automaticamente apos 2-4h (gerenciado pelo simulador)
    CowStatus.ALERT:       {CowStatus.HEALTHY: 0.050},
}

@dataclass
class CowState:
    device_id: str
    status: CowStatus
    calving_started_at: datetime | None = None
    temp_base: float = 38.5          # temperatura base para esta vaca
    hr_base: float = 62.0            # FC base para esta vaca
    accel_z_history: deque = field(default_factory=lambda: deque(maxlen=60))
```

### 8.4 `simulator/sensor_generator.py`

Parametros de geracao por estado (com ruido gaussiano):

```python
import random
import math
from .cow_state import CowState, CowStatus

# (media_offset, desvio_padrao)
HR_PARAMS = {
    CowStatus.HEALTHY:     (0,   5),
    CowStatus.HEAT_STRESS: (40,  8),
    CowStatus.CALVING:     (30,  6),
    CowStatus.ALERT:       (20, 10),
}

TEMP_PARAMS = {
    CowStatus.HEALTHY:     (0,    0.20),
    CowStatus.HEAT_STRESS: (0.8,  0.30),
    CowStatus.CALVING:     (-0.3, 0.15),  # queda de temperatura pre-parto
    CowStatus.ALERT:       (0.4,  0.40),
}

def generate_heart_rate(state: CowState, rng: random.Random) -> int:
    offset, std = HR_PARAMS[state.status]
    value = state.hr_base + offset + rng.gauss(0, std)
    return max(30, min(200, round(value)))

def generate_temperature(state: CowState, rng: random.Random) -> float:
    offset, std = TEMP_PARAMS[state.status]
    value = state.temp_base + offset + rng.gauss(0, std)
    return max(35.0, min(42.0, round(value, 2)))

def generate_accelerometer(state: CowState, rng: random.Random) -> list[float]:
    if state.status == CowStatus.CALVING:
        # Movimentos posturais fortes no eixo Z
        ax = rng.gauss(0, 0.3)
        ay = rng.gauss(0, 0.3)
        az = rng.gauss(1.0, 0.6)  # desvio maior em Z
    elif state.status == CowStatus.HEAT_STRESS:
        # Agitacao em X e Y
        ax = rng.gauss(0, 0.9)
        ay = rng.gauss(0, 0.9)
        az = rng.gauss(1.0, 0.2)
    else:
        ax = rng.gauss(0, 0.1)
        ay = rng.gauss(0, 0.1)
        az = rng.gauss(1.0, 0.1)
    return [round(ax, 4), round(ay, 4), round(az, 4)]

def generate_gyroscope(state: CowState, rng: random.Random) -> list[float]:
    scale = 20.0 if state.status in (CowStatus.CALVING, CowStatus.HEAT_STRESS) else 5.0
    return [round(rng.gauss(0, scale), 4) for _ in range(3)]
```

### 8.5 `simulator/payload_builder.py`

```python
from datetime import datetime, timezone
from .cow_state import CowState
from .sensor_generator import (
    generate_heart_rate, generate_temperature,
    generate_accelerometer, generate_gyroscope
)
import random

def build_payload(state: CowState, rng: random.Random) -> dict:
    return {
        "device_id": state.device_id,
        "datetime": datetime.now(timezone.utc).isoformat(),
        "sensors": {
            "max30102": {
                "heart_rate": generate_heart_rate(state, rng)
            },
            "mlx": {
                "object_temp": generate_temperature(state, rng)
            },
            "mpu": {
                "acc": generate_accelerometer(state, rng),
                "gyro": generate_gyroscope(state, rng)
            }
        }
    }
```

### 8.6 `simulator/simulator.py` — Logica Principal

```
Algoritmo:
  1. Carrega lista de 160 device_ids de data/collar_ids.json
  2. Inicializa CowState para cada ID (distribui status conforme STATUS_DISTRIBUTION)
  3. Inicializa rng com SIM_SEED para reproducibilidade
  4. Conecta no broker MQTT (paho-mqtt)
  5. Loop infinito:
     a. Divide as 160 vacas em batches de SIM_BATCH_SIZE
     b. Para cada batch:
        - Evolui transicoes de estado (TRANSITION_MATRIX com probabilidades)
        - Verifica CALVING expirado (> 3 horas -> volta para HEALTHY)
        - Para cada vaca no batch:
            * build_payload(state, rng)
            * mqtt.publish(f"cowhealth/sensors/{state.device_id}", json.dumps(payload), qos=1)
            * log: [device_id] HR=72bpm TEMP=38.7C STATUS=HEALTHY
        - Aguarda SIM_INTERVAL_SECONDS / numero_de_batches (distribui carga)
  6. Em caso de desconexao: reconecta com backoff exponencial (1s, 2s, 4s, max 60s)
```

---

## 9. Plano Detalhado — Worker MQTT -> Backend

### 9.1 `worker/mqtt_consumer.py`

```
Algoritmo:
  1. Conecta no broker MQTT como cowhealth-worker
  2. Assina: cowhealth/sensors/+  (QoS 1)
  3. Para cada mensagem recebida:
     a. Parse JSON
     b. Valida campos: device_id, datetime, sensors.max30102, sensors.mlx, sensors.mpu
     c. Chama api_client.ingest(payload)
     d. Log resultado
  4. Reconexao automatica com backoff exponencial
```

### 9.2 `worker/api_client.py`

```python
import requests
from config.settings import BACKEND_URL, MQTT_WORKER_API_KEY

INGEST_URL = f"{BACKEND_URL}/mqtt/ingest"

def ingest(payload: dict) -> bool:
    try:
        response = requests.post(
            INGEST_URL,
            json=payload,
            headers={"Authorization": f"Bearer {MQTT_WORKER_API_KEY}"},
            timeout=5
        )
        if response.status_code == 200:
            return True
        if response.status_code == 404:
            # Colar nao encontrado no BD — ignorar (colar nao foi seedado)
            print(f"[WARN] Colar nao encontrado: {payload.get('device_id')}")
            return False
        print(f"[ERROR] Backend retornou {response.status_code}: {response.text}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Falha ao chamar backend: {e}")
        return False
```

---

## 10. Endpoint a Criar no Backend (`cowhealth-ai-monorepo`)

### `POST /mqtt/ingest`

**Autenticacao:** API Key via header `Authorization: Bearer {MQTT_WORKER_API_KEY}`

**Logica:**
1. Valida API Key contra `process.env.MQTT_WORKER_API_KEY`
2. Extrai `device_id` do payload
3. Busca `Collar` onde `name = device_id`
4. Se nao encontrado: retorna 404
5. Busca `Cow` associada ao colar
6. Persiste os dados:
   - `heart_rate_data`: bpm + measuredAt (datetime do payload)
   - `temperature_data`: celsius + measuredAt
   - `accelerometer_data`: accelX/Y/Z + gyroX/Y/Z + measuredAt
7. Executa analise de saude:
   - Verifica condicoes de CALVING e HEAT_STRESS
   - Se detectado: atualiza `cow.status` e cria `Notification` para usuarios ADMIN/MANAGER
8. Retorna 200 com `{ received: true }`

**Arquivo a criar:** `backend/src/routes/mqttRoutes.ts` + `backend/src/services/mqttIngestService.ts`

---

## 11. Dependencias Python

```
# requirements.txt
paho-mqtt==2.1.0
requests==2.32.3
python-dotenv==1.0.1
```

---

## 12. Variaveis de Ambiente

```bash
# .env.example

# Broker MQTT
MQTT_BROKER=broker.emqx.io
MQTT_PORT=1883
MQTT_CLIENT_ID_SIM=cowhealth-simulator
MQTT_CLIENT_ID_WORKER=cowhealth-worker
MQTT_TOPIC_PREFIX=cowhealth/sensors

# Simulador
SIM_COW_COUNT=160
SIM_INTERVAL_SECONDS=30
SIM_BATCH_SIZE=10
SIM_SEED=42

# Worker -> Backend
BACKEND_URL=http://localhost:3001
MQTT_WORKER_API_KEY=secret_iot_key_here

# Logs
LOG_LEVEL=INFO
```

---

## 13. `scripts/seed_collars_api.py`

Script one-shot que registra os 160 colares no backend apos `generate_collars.py`:

```python
import json
import requests
import sys

BACKEND_URL = "http://localhost:3001"
ADMIN_TOKEN = "..."  # token JWT de um usuario ADMIN

with open("data/collar_ids.json") as f:
    ids = json.load(f)

headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
created = 0
skipped = 0

for device_id in ids:
    resp = requests.post(
        f"{BACKEND_URL}/collars",
        json={"name": device_id, "status": "ACTIVE", "dataFrequency": "DEFAULT"},
        headers=headers
    )
    if resp.status_code in (200, 201):
        created += 1
    elif resp.status_code == 409:  # ja existe
        skipped += 1
    else:
        print(f"[WARN] {device_id}: {resp.status_code} {resp.text}")

print(f"Concluido: {created} criados, {skipped} ja existiam")
```

---

## 14. Sequencia de Execucao

```bash
# 1. Clonar repositorio IoT (apos criacao no GitHub)
git clone https://github.com/{seu-usuario}/cowhealth-iot-simulator
cd cowhealth-iot-simulator

# 2. Ambiente virtual e dependencias
python -m venv .venv
source .venv/bin/activate      # Linux/Mac
# .venv\Scripts\activate       # Windows
pip install -r requirements.txt

# 3. Configurar variaveis
cp .env.example .env
# Editar .env: BACKEND_URL, MQTT_WORKER_API_KEY, etc.

# 4. Gerar os 160 device_ids
python scripts/generate_collars.py
# -> Cria data/collar_ids.json

# 5. Com o backend rodando, registrar colares no BD
# (obter um token JWT de admin primeiro)
python scripts/seed_collars_api.py
# -> 160 colares criados via API

# 6. Rodar em dois terminais separados:

# Terminal 1 — Worker (consome MQTT e salva no BD)
python -m worker.worker

# Terminal 2 — Simulador (publica dados no MQTT)
python -m simulator.simulator
```

---

## 15. Checklist de Entregaveis

### Repositorio `cowhealth-iot-simulator`
- [ ] README.md com instrucoes de setup
- [ ] .env.example documentado
- [ ] requirements.txt
- [ ] config/settings.py
- [ ] scripts/generate_collars.py
- [ ] scripts/seed_collars_api.py
- [ ] simulator/cow_state.py
- [ ] simulator/sensor_generator.py
- [ ] simulator/payload_builder.py
- [ ] simulator/simulator.py
- [ ] worker/mqtt_consumer.py
- [ ] worker/api_client.py
- [ ] worker/worker.py
- [ ] tests basicos

### Backend `cowhealth-ai-monorepo`
- [ ] Endpoint POST /mqtt/ingest
- [ ] Middleware de API Key
- [ ] Logica de analise de saude (CALVING / HEAT_STRESS)
- [ ] Disparo de notificacoes automaticas
- [ ] Variavel MQTT_WORKER_API_KEY no .env

---

## 16. Notas Finais

- **Broker publico:** `broker.emqx.io` e adequado para desenvolvimento. Nao use dados sensiveis (sem criptografia na porta 1883). Para TLS use porta 8883.
- **Volume:** 160 vacas com intervalo de 30s geram ~5-6 mensagens/segundo. O broker publico suporta facilmente.
- **Realismo:** O simulador usa distribuicao gaussiana para que os graficos do dashboard parecam dados reais de campo.
- **Reproducibilidade:** `SIM_SEED=42` garante que os mesmos device_ids sejam gerados em qualquer maquina.
- **Intervalos sugeridos:** Dev = 30s | Staging = 2min (HIGHER) | Prod = 10min (DEFAULT)
- **Seguranca futura:** Usar MQTT com TLS (porta 8883) e autenticacao usuario/senha no broker para producao.