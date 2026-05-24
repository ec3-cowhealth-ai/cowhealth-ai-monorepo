# Task: Adicionar Geolocalização nas Fazendas

## Contexto

O simulador MQTT (`cowhealth-iot-simulator`) irá simular o movimento das vacas dentro dos limites
de cada fazenda. Para isso, o backend precisa conhecer as coordenadas geográficas (latitude/longitude)
de cada fazenda.

---

## O que fazer

### 1. Prisma Schema — `backend/prisma/schema.prisma`

Adicionar os campos `latitude` e `longitude` ao model `Farm`:

```prisma
model Farm {
  // ... campos existentes ...
  latitude  Float?
  longitude Float?
  // ...
}
```

### 2. Migration

Gerar a migration com:

```bash
npx prisma migrate dev --name add_geolocation_to_farms
```

### 3. Seed — `backend/prisma/seed.ts`

Ao criar as 5 fazendas fixas (conforme TODO já existente no arquivo), incluir as coordenadas:

| Farm | Latitude    | Longitude    |
|------|-------------|--------------|
| 1    | -23.401850  | -51.124920   |
| 2    | -19.829420  | -47.867680   |
| 3    | -16.765300  | -49.072400   |
| 4    | -20.603800  | -48.628600   |
| 5    | -15.739500  | -56.048200   |

### 4. Tipos TypeScript — frontend

Verificar se os tipos de `Farm` no frontend precisam ser atualizados para incluir
`latitude` e `longitude` opcionais.

### 5. Serialização — backend

Garantir que o endpoint `GET /farms` (e `GET /farms/:id`) retorna os novos campos na resposta.

---

## SQL de referência (ambiente de desenvolvimento)

Caso precise popular o banco sem rodar o seed completo:

```sql
UPDATE farms SET latitude = -23.401850, longitude = -51.124920 WHERE id = 1;
UPDATE farms SET latitude = -19.829420, longitude = -47.867680 WHERE id = 2;
UPDATE farms SET latitude = -16.765300, longitude = -49.072400 WHERE id = 3;
UPDATE farms SET latitude = -20.603800, longitude = -48.628600 WHERE id = 4;
UPDATE farms SET latitude = -15.739500, longitude = -56.048200 WHERE id = 5;
```

---

## Critérios de aceite

- [ ] Migration criada e aplicada sem erros
- [ ] Seed popula as 5 fazendas com as coordenadas acima
- [ ] `GET /farms` retorna `latitude` e `longitude` na resposta
- [ ] Campos nullable — fazendas sem coordenadas nao quebram o sistema
- [ ] Tipos do frontend atualizados
