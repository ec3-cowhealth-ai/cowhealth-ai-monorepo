-- ============================================================
-- CowHealth AI — Seed Data SQL
-- Gerado: 2026-05-22
-- Totais: 5 fazendas | 200 colares | 160 vacas | 8 perfis
--
-- Como usar:
--   mysql -u USER -p -P 33071 cowhealth-db < prisma/seed_data.sql
--
-- AVISO sobre senhas:
--   Os hashes de senha sao placeholders. Para ativar login:
--   cd backend && node -e "
--     const b = require('bcrypt');
--     b.hash('password123', 12).then(h => console.log(h));
--   "
--   Substitua '$2b$12$HASH_PLACEHOLDER' pelo hash gerado.
--   Ou rode o seed.ts para gerar usuarios com senha valida.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ============================================================
-- LIMPEZA (ordem de dependencia)
-- ============================================================
TRUNCATE TABLE accelerometer_data;
TRUNCATE TABLE temperature_data;
TRUNCATE TABLE heart_rate_data;
TRUNCATE TABLE notifications;
TRUNCATE TABLE cows;
TRUNCATE TABLE collars;
TRUNCATE TABLE farms;
TRUNCATE TABLE user_roles;
TRUNCATE TABLE users;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE permission_group_permissions;
TRUNCATE TABLE permission_groups;
TRUNCATE TABLE roles;
TRUNCATE TABLE permissions;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- PERMISSIONS (37)
-- ============================================================
INSERT INTO permissions (id, name, created_at) VALUES
(1,  'ViewAny Farm',            NOW()),
(2,  'View Farm',               NOW()),
(3,  'Create Farm',             NOW()),
(4,  'Update Farm',             NOW()),
(5,  'Delete Farm',             NOW()),
(6,  'ViewAny Collar',          NOW()),
(7,  'View Collar',             NOW()),
(8,  'Create Collar',           NOW()),
(9,  'Update Collar',           NOW()),
(10, 'Delete Collar',           NOW()),
(11, 'ViewAny Cow',             NOW()),
(12, 'View Cow',                NOW()),
(13, 'Create Cow',              NOW()),
(14, 'Update Cow',              NOW()),
(15, 'Delete Cow',              NOW()),
(16, 'ViewAny User',            NOW()),
(17, 'View User',               NOW()),
(18, 'Create User',             NOW()),
(19, 'Update User',             NOW()),
(20, 'Delete User',             NOW()),
(21, 'ViewAny Role',            NOW()),
(22, 'View Role',               NOW()),
(23, 'Create Role',             NOW()),
(24, 'Update Role',             NOW()),
(25, 'Delete Role',             NOW()),
(26, 'ViewAny Permission',      NOW()),
(27, 'View Permission',         NOW()),
(28, 'Create Permission',       NOW()),
(29, 'Update Permission',       NOW()),
(30, 'Delete Permission',       NOW()),
(31, 'ViewAny PermissionGroup', NOW()),
(32, 'View PermissionGroup',    NOW()),
(33, 'Create PermissionGroup',  NOW()),
(34, 'Update PermissionGroup',  NOW()),
(35, 'Delete PermissionGroup',  NOW()),
(36, 'ViewAny Notification',    NOW()),
(37, 'View Notification',       NOW());

-- ============================================================
-- ROLES (8 perfis distintos)
-- ============================================================
INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
(1, 'SuperAdmin',         'Acesso total ao sistema',                      NOW(), NOW()),
(2, 'Administrador',      'Administracao geral sem gestao de permissoes',  NOW(), NOW()),
(3, 'Veterinario',        'Gestao de saude animal e registros clinicos',   NOW(), NOW()),
(4, 'Zootecnista',        'Producao animal, nutricao e reproducao',        NOW(), NOW()),
(5, 'Gerente de Fazenda', 'Gestao operacional da fazenda',                 NOW(), NOW()),
(6, 'Operador de Campo',  'Monitoramento e leitura de dados em campo',     NOW(), NOW()),
(7, 'Financeiro',         'Acesso a relatorios e dados de fazendas',       NOW(), NOW()),
(8, 'Observador',         'Acesso somente leitura',                        NOW(), NOW());

-- ============================================================
-- ROLE_PERMISSIONS
-- ============================================================

-- SuperAdmin (1): todas as 37 permissoes
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(1,10),
(1,11),(1,12),(1,13),(1,14),(1,15),(1,16),(1,17),(1,18),(1,19),(1,20),
(1,21),(1,22),(1,23),(1,24),(1,25),(1,26),(1,27),(1,28),(1,29),(1,30),
(1,31),(1,32),(1,33),(1,34),(1,35),(1,36),(1,37);

-- Administrador (2): tudo exceto Permission e PermissionGroup
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2,1),(2,2),(2,3),(2,4),(2,5),(2,6),(2,7),(2,8),(2,9),(2,10),
(2,11),(2,12),(2,13),(2,14),(2,15),(2,16),(2,17),(2,18),(2,19),(2,20),
(2,21),(2,22),(2,23),(2,24),(2,25),(2,36),(2,37);

-- Veterinario (3): ViewAny/View geral + CRUD Cow + Notificacoes
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3,1),(3,2),(3,6),(3,7),(3,11),(3,12),(3,13),(3,14),(3,15),
(3,16),(3,17),(3,36),(3,37);

-- Zootecnista (4): ViewAny/View + CRUD Cow + Create/Update Collar
INSERT INTO role_permissions (role_id, permission_id) VALUES
(4,1),(4,2),(4,6),(4,7),(4,8),(4,9),(4,11),(4,12),(4,13),(4,14),
(4,36),(4,37);

-- Gerente de Fazenda (5): CRUD Farm + ViewAny/View restante + Notificacoes
INSERT INTO role_permissions (role_id, permission_id) VALUES
(5,1),(5,2),(5,3),(5,4),(5,6),(5,7),(5,11),(5,12),(5,16),(5,17),
(5,36),(5,37);

-- Operador de Campo (6): ViewAny/View Cow e Collar + Notificacoes
INSERT INTO role_permissions (role_id, permission_id) VALUES
(6,1),(6,6),(6,7),(6,11),(6,12),(6,36),(6,37);

-- Financeiro (7): ViewAny/View Farm e User + Notificacoes
INSERT INTO role_permissions (role_id, permission_id) VALUES
(7,1),(7,2),(7,16),(7,17),(7,36),(7,37);

-- Observador (8): ViewAny somente
INSERT INTO role_permissions (role_id, permission_id) VALUES
(8,1),(8,6),(8,11),(8,36);

-- ============================================================
-- PERMISSION_GROUPS (3 grupos semanticos)
-- ============================================================
INSERT INTO permission_groups (id, name, description, created_at) VALUES
(1, 'Gestao Animal',    'Permissoes relacionadas a vacas e colares', NOW()),
(2, 'Gestao de Acesso', 'Permissoes de usuarios, roles e permissoes', NOW()),
(3, 'Gestao de Campo',  'Permissoes de fazendas e notificacoes',     NOW());

INSERT INTO permission_group_permissions (group_id, permission_id) VALUES
-- Gestao Animal: Collar + Cow
(1,6),(1,7),(1,8),(1,9),(1,10),(1,11),(1,12),(1,13),(1,14),(1,15),
-- Gestao de Acesso: User + Role + Permission + PermissionGroup
(2,16),(2,17),(2,18),(2,19),(2,20),(2,21),(2,22),(2,23),(2,24),(2,25),
(2,26),(2,27),(2,28),(2,29),(2,30),(2,31),(2,32),(2,33),(2,34),(2,35),
-- Gestao de Campo: Farm + Notification
(3,1),(3,2),(3,3),(3,4),(3,5),(3,36),(3,37);

-- ============================================================
-- USERS (8)
-- Senha placeholder — veja instrucoes no cabecalho
-- ============================================================
INSERT INTO users (id, name, email, password_hash, profile, active, created_at, updated_at) VALUES
(1, 'Admin Sistema',     'admin@cowhealth.com',      '$2b$12$HASH_PLACEHOLDER', 'ADMIN',   1, NOW(), NOW()),
(2, 'Carlos Gerente',    'gerente@cowhealth.com',    '$2b$12$HASH_PLACEHOLDER', 'ADMIN',   1, NOW(), NOW()),
(3, 'Dra. Ana Vet',      'vet@cowhealth.com',        '$2b$12$HASH_PLACEHOLDER', 'MANAGER', 1, NOW(), NOW()),
(4, 'Bruno Zootecnista', 'zoot@cowhealth.com',       '$2b$12$HASH_PLACEHOLDER', 'MANAGER', 1, NOW(), NOW()),
(5, 'Silvio Fazendeiro', 'fazenda@cowhealth.com',    '$2b$12$HASH_PLACEHOLDER', 'MANAGER', 1, NOW(), NOW()),
(6, 'Lucas Operador',    'operador@cowhealth.com',   '$2b$12$HASH_PLACEHOLDER', 'VIEWER',  1, NOW(), NOW()),
(7, 'Patricia Fin',      'financeiro@cowhealth.com', '$2b$12$HASH_PLACEHOLDER', 'VIEWER',  1, NOW(), NOW()),
(8, 'Roberto Obs',       'obs@cowhealth.com',        '$2b$12$HASH_PLACEHOLDER', 'VIEWER',  1, NOW(), NOW());

-- ============================================================
-- USER_ROLES
-- ============================================================
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- Admin Sistema     -> SuperAdmin
(2, 2), -- Carlos Gerente    -> Administrador
(3, 3), -- Dra. Ana Vet      -> Veterinario
(4, 4), -- Bruno Zootecnista -> Zootecnista
(5, 5), -- Silvio Fazendeiro -> Gerente de Fazenda
(6, 6), -- Lucas Operador    -> Operador de Campo
(7, 7), -- Patricia Fin      -> Financeiro
(8, 8); -- Roberto Obs       -> Observador

-- ============================================================
-- FARMS (5)
-- ============================================================
INSERT INTO farms (id, name, cnpj, address, city, state, phone, email, created_at, updated_at) VALUES
(1, 'Fazenda Aurora',         '12.345.678/0001-01', 'Rod. BR-376, km 120',  'Londrina',        'PR', '(43) 99001-0001', 'contato@fazendaaurora.com.br',        NOW(), NOW()),
(2, 'Fazenda Boa Esperanca',  '23.456.789/0001-02', 'Rod. MG-050, km 248',  'Uberaba',         'MG', '(34) 99002-0002', 'contato@fazendaboaesperanca.com.br',  NOW(), NOW()),
(3, 'Fazenda Sao Bento',      '34.567.890/0001-03', 'Rod. GO-020, km 85',   'Goiania',         'GO', '(62) 99003-0003', 'contato@fazendasaobento.com.br',      NOW(), NOW()),
(4, 'Fazenda Alvorada',       '45.678.901/0001-04', 'Rod. SP-330, km 402',  'Barretos',        'SP', '(17) 99004-0004', 'contato@fazendaalvorada.com.br',      NOW(), NOW()),
(5, 'Fazenda Esperanca',      '56.789.012/0001-05', 'Rod. MT-040, km 310',  'Cuiaba',          'MT', '(65) 99005-0005', 'contato@fazendaesperanca.com.br',     NOW(), NOW());

-- ============================================================
-- COLLARS (200) — via stored procedure
-- 1-160:   ACTIVE (atribuidos as vacas)
-- 161-180: ACTIVE (estoque)
-- 181-190: MAINTENANCE
-- 191-195: INACTIVE
-- 196-200: BATTERY
-- ============================================================
DROP PROCEDURE IF EXISTS seed_collars;
DELIMITER //
CREATE PROCEDURE seed_collars()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE v_status VARCHAR(20);
  DECLARE v_freq   VARCHAR(20);

  WHILE i <= 200 DO
    IF i <= 160 THEN
      SET v_status = 'ACTIVE';
      -- A cada 8 colares um com HIGHER (vacas em alerta), a cada 12 um LOWER
      SET v_freq = CASE
        WHEN MOD(i, 8)  = 0 THEN 'HIGHER'
        WHEN MOD(i, 12) = 0 THEN 'LOWER'
        ELSE 'DEFAULT'
      END;
    ELSEIF i <= 180 THEN
      SET v_status = 'ACTIVE';
      SET v_freq   = 'DEFAULT';
    ELSEIF i <= 190 THEN
      SET v_status = 'MAINTENANCE';
      SET v_freq   = 'DEFAULT';
    ELSEIF i <= 195 THEN
      SET v_status = 'INACTIVE';
      SET v_freq   = 'DEFAULT';
    ELSE
      SET v_status = 'BATTERY';
      SET v_freq   = 'DEFAULT';
    END IF;

    INSERT INTO collars (id, name, status, data_frequency, created_at, updated_at)
    VALUES (i, CONCAT('collar-', LPAD(i, 3, '0')), v_status, v_freq, NOW(), NOW());

    SET i = i + 1;
  END WHILE;
END //
DELIMITER ;

CALL seed_collars();
DROP PROCEDURE IF EXISTS seed_collars;

-- ============================================================
-- COWS (160) — via stored procedure
-- Distribuicao por fazenda: 32 vacas cada
--   Farm 1: cows  1- 32
--   Farm 2: cows 33- 64
--   Farm 3: cows 65- 96
--   Farm 4: cows 97-128
--   Farm 5: cows 129-160
-- Status por posicao dentro da fazenda (0-31):
--   0-21:  HEALTHY     (22 vacas, 69%)
--   22-25: HEAT_STRESS ( 4 vacas, 12%)
--   26-29: ALERT       ( 4 vacas, 12%)
--   30-31: CALVING     ( 2 vacas,  6%)
-- ============================================================
DROP PROCEDURE IF EXISTS seed_cows;
DELIMITER //
CREATE PROCEDURE seed_cows()
BEGIN
  DECLARE i            INT DEFAULT 1;
  DECLARE v_pos        INT;   -- posicao dentro da fazenda (0-31)
  DECLARE v_name       VARCHAR(50);
  DECLARE v_breed      VARCHAR(50);
  DECLARE v_birth_date DATE;
  DECLARE v_weight     DECIMAL(6,2);
  DECLARE v_status     VARCHAR(20);
  DECLARE v_farm_id    INT;

  WHILE i <= 160 DO
    SET v_farm_id = CEIL(i / 32.0);
    SET v_pos     = MOD(i - 1, 32);

    -- Nome (32 nomes ciclicos)
    SET v_name = ELT(v_pos + 1,
      'Mimosa','Bonita','Estrela','Clarinha','Morena','Dolly','Luna','Bella',
      'Joia','Rainha','Branca','Preta','Malhada','Marrom','Vermelha','Rosa',
      'Flor','Vento','Chuva','Sol','Noite','Madrugada','Amanhecer','Entardecer',
      'Brisa','Nuvem','Montanha','Rio','Bosque','Prado','Colina','Vale');

    -- Raca (13 racas ciclicas)
    SET v_breed = ELT(MOD(i - 1, 13) + 1,
      'Nelore','Gir','Holandesa','Angus','Braford','Tabapua','Caracu',
      'Simmental','Charoles','Santa Gertrudis','Simbra','Guzera','Indubrasil');

    -- Data de nascimento (10 datas ciclicas, entre 1 e 10 anos atras)
    SET v_birth_date = ELT(MOD(i - 1, 10) + 1,
      '2016-06-15','2017-03-20','2018-08-10','2019-04-25','2020-11-05',
      '2021-02-14','2022-07-30','2023-01-18','2024-05-09','2025-03-22');

    -- Peso em kg (10 valores ciclicos entre 395 e 595)
    SET v_weight = CASE MOD(i - 1, 10)
      WHEN 0 THEN 395.5
      WHEN 1 THEN 418.0
      WHEN 2 THEN 440.5
      WHEN 3 THEN 462.0
      WHEN 4 THEN 483.5
      WHEN 5 THEN 505.0
      WHEN 6 THEN 527.5
      WHEN 7 THEN 550.0
      WHEN 8 THEN 572.5
      ELSE        595.0
    END;

    -- Status baseado na posicao dentro da fazenda
    SET v_status = CASE
      WHEN v_pos < 22 THEN 'HEALTHY'
      WHEN v_pos < 26 THEN 'HEAT_STRESS'
      WHEN v_pos < 30 THEN 'ALERT'
      ELSE                 'CALVING'
    END;

    INSERT INTO cows (id, tag, name, breed, birth_date, weight, status, farm_id, collar_id, created_at, updated_at)
    VALUES (
      i,
      CONCAT('BR-', LPAD(i, 4, '0')),
      v_name,
      v_breed,
      v_birth_date,
      v_weight,
      v_status,
      v_farm_id,
      i,   -- collar_id = cow_id (colar collar-001 na vaca BR-0001, etc.)
      NOW(),
      NOW()
    );

    SET i = i + 1;
  END WHILE;
END //
DELIMITER ;

CALL seed_cows();
DROP PROCEDURE IF EXISTS seed_cows;

-- ============================================================
-- SENSOR DATA — 7 dias (168h) para cada uma das 160 vacas
-- Total aproximado: 160 * 169 * 3 tabelas = ~81.000 registros
--
-- Cenario por cow_id:
--   mod 7 = 1 ou 2: HEAT_STRESS (BPM e temp elevados nas ultimas 6h)
--   mod 7 = 3:      CALVING     (movimentacao irregular nas ultimas 6h)
--   demais:         HEALTHY     (valores normais)
-- ============================================================
DROP PROCEDURE IF EXISTS seed_sensors;
DELIMITER //
CREATE PROCEDURE seed_sensors()
BEGIN
  DECLARE v_cow    INT DEFAULT 1;
  DECLARE v_h      INT;
  DECLARE v_ts     DATETIME;
  DECLARE v_bpm    INT;
  DECLARE v_temp   DECIMAL(4,1);
  DECLARE v_ax     DECIMAL(6,3);
  DECLARE v_ay     DECIMAL(6,3);
  DECLARE v_az     DECIMAL(6,3);
  DECLARE v_gx     DECIMAL(6,3);
  DECLARE v_gy     DECIMAL(6,3);
  DECLARE v_gz     DECIMAL(6,3);
  DECLARE v_scene  INT; -- 0=healthy, 1=heat_stress, 2=calving

  WHILE v_cow <= 160 DO
    SET v_scene = CASE
      WHEN MOD(v_cow, 7) IN (1, 2) THEN 1  -- heat_stress
      WHEN MOD(v_cow, 7) = 3       THEN 2  -- calving
      ELSE                               0  -- healthy
    END;

    SET v_h = 168; -- 7 dias atras

    WHILE v_h >= 0 DO
      SET v_ts = DATE_SUB(NOW(), INTERVAL v_h HOUR);

      -- Gera leituras conforme cenario e proximidade do momento atual
      IF v_scene = 1 AND v_h <= 6 THEN
        -- Estresse termico recente
        SET v_bpm  = 102 + FLOOR(RAND() * 17);
        SET v_temp = ROUND(39.2 + RAND() * 0.9, 1);
        SET v_ax   = ROUND(0.9  + RAND() * 0.9, 3);
        SET v_ay   = ROUND(0.9  + RAND() * 0.9, 3);
        SET v_az   = ROUND(8.5  + RAND() * 2.0, 3);
        SET v_gx   = ROUND(-0.8 + RAND() * 1.6, 3);
        SET v_gy   = ROUND(-0.8 + RAND() * 1.6, 3);
        SET v_gz   = ROUND(-0.8 + RAND() * 1.6, 3);

      ELSEIF v_scene = 2 AND v_h <= 6 THEN
        -- Parto iminente recente
        SET v_bpm  = 92  + FLOOR(RAND() * 17);
        SET v_temp = ROUND(38.5 + RAND() * 0.5, 1);
        SET v_ax   = ROUND(-1.2 + RAND() * 2.4, 3);
        SET v_ay   = ROUND(-1.2 + RAND() * 2.4, 3);
        SET v_az   = ROUND(0.6  + RAND() * 0.8, 3);
        SET v_gx   = ROUND(-1.0 + RAND() * 2.0, 3);
        SET v_gy   = ROUND(-1.0 + RAND() * 2.0, 3);
        SET v_gz   = ROUND(-1.0 + RAND() * 2.0, 3);

      ELSE
        -- Normal / saudavel
        SET v_bpm  = 58  + FLOOR(RAND() * 25);
        SET v_temp = ROUND(37.8 + RAND() * 1.0, 1);
        SET v_ax   = ROUND(-0.6 + RAND() * 1.2, 3);
        SET v_ay   = ROUND(-0.6 + RAND() * 1.2, 3);
        SET v_az   = ROUND(9.0  + RAND() * 1.0, 3);
        SET v_gx   = ROUND(-0.3 + RAND() * 0.6, 3);
        SET v_gy   = ROUND(-0.3 + RAND() * 0.6, 3);
        SET v_gz   = ROUND(-0.3 + RAND() * 0.6, 3);
      END IF;

      INSERT INTO heart_rate_data (cow_id, bpm, measured_at, received_at)
      VALUES (v_cow, v_bpm, v_ts, NOW());

      INSERT INTO temperature_data (cow_id, celsius, measured_at, received_at)
      VALUES (v_cow, v_temp, v_ts, NOW());

      INSERT INTO accelerometer_data
        (cow_id, accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, measured_at, received_at)
      VALUES
        (v_cow, v_ax, v_ay, v_az, v_gx, v_gy, v_gz, v_ts, NOW());

      SET v_h = v_h - 1;
    END WHILE;

    SET v_cow = v_cow + 1;
  END WHILE;
END //
DELIMITER ;

CALL seed_sensors();
DROP PROCEDURE IF EXISTS seed_sensors;

-- ============================================================
-- NOTIFICATIONS (100)
-- Distribuidas entre os 8 usuarios e vacas variadas
-- 60% marcadas como lidas
-- ============================================================
INSERT INTO notifications (user_id, cow_id, title, message, read_at, created_at) VALUES
-- Alertas de estresse termico
(3,  23,  'Alerta: Estresse termico detectado',     'BR-0023 (Malhada) apresentou temperatura acima de 39.5C nas ultimas 3 horas.',                  DATE_SUB(NOW(), INTERVAL 2 HOUR),  DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(3,  55,  'Alerta: Estresse termico detectado',     'BR-0055 (Malhada) com BPM acima de 110 por mais de 2 horas consecutivas.',                       DATE_SUB(NOW(), INTERVAL 1 HOUR),  DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(5,  87,  'Alerta: Estresse termico detectado',     'BR-0087 (Malhada) — temperatura corporal de 39.8C registrada. Verificar sombreamento.',          NULL,                              DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(6, 119,  'Alerta: Estresse termico detectado',     'BR-0119 (Malhada) com multiplos alertas de calor. Acionar veterinario.',                         NULL,                              DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 151,  'Alerta: Estresse termico detectado',     'BR-0151 (Malhada) — leituras criticas de temperatura nas ultimas 6 horas.',                      NULL,                              DATE_SUB(NOW(), INTERVAL 30 MINUTE)),

-- Alertas de parto
(3,  31,  'Alerta: Parto iminente detectado',       'BR-0031 (Colina) com padrao de movimentacao indicando parto iminente. Monitorar.',               DATE_SUB(NOW(), INTERVAL 3 HOUR),  DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(3,  63,  'Alerta: Parto iminente detectado',       'BR-0063 (Colina) — acelerometro detectou movimentacao atipica. Verificar baia de parto.',        DATE_SUB(NOW(), INTERVAL 1 HOUR),  DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(4,  95,  'Alerta: Parto iminente detectado',       'BR-0095 (Colina) com temperatura em queda progressiva — sinal de parto nas proximas horas.',     NULL,                              DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(5, 127,  'Alerta: Parto iminente detectado',       'BR-0127 (Colina) — comportamento de nidificacao detectado. Equipe em standby.',                  NULL,                              DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(3, 159,  'Alerta: Parto iminente detectado',       'BR-0159 (Colina) em estagio inicial de parto. Acionar equipe veterinaria.',                      NULL,                              DATE_SUB(NOW(), INTERVAL 15 MINUTE)),

-- Alertas de frequencia cardiaca
(3,  24,  'Alerta: Frequencia cardiaca elevada',    'BR-0024 (Marrom) — BPM de 115 registrado. Investigar causa.',                                   DATE_SUB(NOW(), INTERVAL 4 HOUR),  DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(4,  56,  'Alerta: Frequencia cardiaca elevada',    'BR-0056 (Marrom) com BPM acima de 108 por 90 minutos consecutivos.',                             DATE_SUB(NOW(), INTERVAL 2 HOUR),  DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(6,  88,  'Alerta: Frequencia cardiaca elevada',    'BR-0088 (Marrom) — pico de 120 BPM detectado. Possivel reagao ao estresse.',                     NULL,                              DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 120,  'Alerta: Frequencia cardiaca elevada',    'BR-0120 (Marrom) com arritmia detectada. Necessita avaliacao clinica urgente.',                  NULL,                              DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 152,  'Alerta: Frequencia cardiaca elevada',    'BR-0152 (Marrom) com BPM persistentemente alto por 4 horas.',                                   NULL,                              DATE_SUB(NOW(), INTERVAL 20 MINUTE)),

-- Alertas de temperatura corporal
(3,  25,  'Alerta: Temperatura corporal anormal',   'BR-0025 (Vermelha) com temperatura de 39.9C — possivel febre. Avaliar clinicamente.',            DATE_SUB(NOW(), INTERVAL 5 HOUR),  DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(4,  57,  'Alerta: Temperatura corporal anormal',   'BR-0057 (Vermelha) — temperatura de 39.7C mantida por 3 leituras consecutivas.',                 DATE_SUB(NOW(), INTERVAL 3 HOUR),  DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(5,  89,  'Alerta: Temperatura corporal anormal',   'BR-0089 (Vermelha) com oscilacao de temperatura entre 39.4 e 40.1C.',                            NULL,                              DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, 121,  'Alerta: Temperatura corporal anormal',   'BR-0121 (Vermelha) — hipotermia detectada, temperatura abaixo de 37.5C.',                        NULL,                              DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(3, 153,  'Alerta: Temperatura corporal anormal',   'BR-0153 (Vermelha) com temperatura corporal em queda. Monitorar hidratacao.',                    NULL,                              DATE_SUB(NOW(), INTERVAL 10 MINUTE)),

-- Alertas de movimento reduzido
(6,  26,  'Alerta: Movimento reduzido detectado',   'BR-0026 (Rosa) com atividade fisica abaixo do normal por 12 horas.',                             DATE_SUB(NOW(), INTERVAL 6 HOUR),  DATE_SUB(NOW(), INTERVAL 14 HOUR)),
(6,  58,  'Alerta: Movimento reduzido detectado',   'BR-0058 (Rosa) quase sem movimentacao nas ultimas 8 horas — possivel claudicacao.',              DATE_SUB(NOW(), INTERVAL 4 HOUR),  DATE_SUB(NOW(), INTERVAL 10 HOUR)),
(4,  90,  'Alerta: Movimento reduzido detectado',   'BR-0090 (Rosa) com padrao de movimento atipico. Verificar membros.',                             DATE_SUB(NOW(), INTERVAL 2 HOUR),  DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(6, 122,  'Alerta: Movimento reduzido detectado',   'BR-0122 (Rosa) inativa por periodo prolongado. Possivel prostacao.',                             NULL,                              DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(6, 154,  'Alerta: Movimento reduzido detectado',   'BR-0154 (Rosa) — sensor registrou imobilidade por 6 horas consecutivas.',                        NULL,                              DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Avisos de bateria baixa
(2,  40,  'Aviso: Colar com bateria baixa',         'collar-040 (BR-0040, Vento) com bateria em 12%. Realizar substituicao em breve.',                DATE_SUB(NOW(), INTERVAL 1 DAY),   DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2,  80,  'Aviso: Colar com bateria baixa',         'collar-080 (BR-0080, Sol) com bateria em 8%. Substituicao urgente necessaria.',                  DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 112,  'Aviso: Colar com bateria baixa',         'collar-112 (BR-0112, Chuva) com bateria critica em 4%. Colar pode desligar em breve.',           NULL,                              DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(6, 144,  'Aviso: Colar com bateria baixa',         'collar-144 (BR-0144, Sol) — nivel de bateria nao detectado. Verificar dispositivo.',             NULL,                              DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- Avisos de colar fora de cobertura
(2,  15,  'Aviso: Colar fora de cobertura',         'collar-015 (BR-0015, Rosa) perdeu sinal ha 45 minutos. Verificar localizacao da vaca.',          DATE_SUB(NOW(), INTERVAL 3 HOUR),  DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(5,  48,  'Aviso: Colar fora de cobertura',         'collar-048 (BR-0048, Entardecer) sem sinal por 2 horas. Verificar antena do setor.',             DATE_SUB(NOW(), INTERVAL 1 HOUR),  DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(6,  76,  'Aviso: Colar fora de cobertura',         'collar-076 (BR-0076, Noite) sem transmissao. Checar se animal se afastou da area monitorada.',   NULL,                              DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(6, 130,  'Aviso: Colar fora de cobertura',         'collar-130 (BR-0130, Bonita) sem sinal por 4 horas. Investigar urgente.',                        NULL,                              DATE_SUB(NOW(), INTERVAL 30 MINUTE)),

-- Alertas parametros fora do normal
(3,  27,  'Alerta: Parametros fora do normal',      'BR-0027 (Bosque) com multiplos indicadores alterados. Avaliacao clinica recomendada.',           DATE_SUB(NOW(), INTERVAL 8 HOUR),  DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(4,  59,  'Alerta: Parametros fora do normal',      'BR-0059 (Bosque) — combinacao de temperatura alta e BPM elevado detectada.',                     DATE_SUB(NOW(), INTERVAL 5 HOUR),  DATE_SUB(NOW(), INTERVAL 9 HOUR)),
(3,  91,  'Alerta: Parametros fora do normal',      'BR-0091 (Bosque) com leituras inconsistentes. Possivel falha de sensor ou doenca.',              DATE_SUB(NOW(), INTERVAL 2 HOUR),  DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(5, 123,  'Alerta: Parametros fora do normal',      'BR-0123 (Bosque) — todos os sensores com valores criticos simultaneamente.',                     NULL,                              DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, 155,  'Alerta: Parametros fora do normal',      'BR-0155 (Bosque) com dados de acelerometro e temperatura em nivel critico.',                     NULL,                              DATE_SUB(NOW(), INTERVAL 45 MINUTE)),

-- Historico de alertas antigos (lidos)
(1,   5,  'Alerta: Estresse termico detectado',     'BR-0005 (Morena) — alerta resolvido apos intervencao veterinaria.',                              DATE_SUB(NOW(), INTERVAL 2 DAY),   DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1,  10,  'Alerta: Parto iminente detectado',       'BR-0010 (Rainha) — parto realizado com sucesso. Bezerro saudavel.',                              DATE_SUB(NOW(), INTERVAL 5 DAY),   DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2,  20,  'Alerta: Frequencia cardiaca elevada',    'BR-0020 (Noite) — normalizada apos tratamento.',                                                 DATE_SUB(NOW(), INTERVAL 7 DAY),   DATE_SUB(NOW(), INTERVAL 7 DAY)),
(3,  30,  'Alerta: Temperatura corporal anormal',   'BR-0030 (Colina) — febre tratada, animal recuperado.',                                           DATE_SUB(NOW(), INTERVAL 10 DAY),  DATE_SUB(NOW(), INTERVAL 10 DAY)),
(4,  45,  'Aviso: Colar com bateria baixa',         'collar-045 (BR-0045) — bateria substituida.',                                                    DATE_SUB(NOW(), INTERVAL 4 DAY),   DATE_SUB(NOW(), INTERVAL 5 DAY)),
(5,  60,  'Alerta: Parto iminente detectado',       'BR-0060 (Chuva) — parto bem sucedido. Bezerro em observacao.',                                   DATE_SUB(NOW(), INTERVAL 8 DAY),   DATE_SUB(NOW(), INTERVAL 8 DAY)),
(6,  75,  'Aviso: Colar fora de cobertura',         'collar-075 — sinal restabelecido apos reinicio do gateway.',                                     DATE_SUB(NOW(), INTERVAL 3 DAY),   DATE_SUB(NOW(), INTERVAL 3 DAY)),
(7, 100,  'Alerta: Estresse termico detectado',     'BR-0100 (Rainha) — animal transferida para area com sombra e agua.',                             DATE_SUB(NOW(), INTERVAL 6 DAY),   DATE_SUB(NOW(), INTERVAL 6 DAY)),
(8, 115,  'Alerta: Movimento reduzido detectado',   'BR-0115 (Noite) — claudicacao leve tratada. Animal em recuperacao.',                             DATE_SUB(NOW(), INTERVAL 9 DAY),   DATE_SUB(NOW(), INTERVAL 9 DAY)),
(1, 140,  'Alerta: Parametros fora do normal',      'BR-0140 (Clarinha) — exames realizados. Quadro benigno, sem intervencao necessaria.',            DATE_SUB(NOW(), INTERVAL 12 DAY),  DATE_SUB(NOW(), INTERVAL 12 DAY)),

-- Alertas de fazenda especifica (Farm 2 — Boa Esperanca)
(5,  35,  'Alerta: Estresse termico detectado',     'BR-0035 (Morena) na Fazenda Boa Esperanca. Temperatura ambiente de 38C na regiao.',              DATE_SUB(NOW(), INTERVAL 4 HOUR),  DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(5,  38,  'Alerta: Estresse termico detectado',     'BR-0038 (Malhada) na Fazenda Boa Esperanca — multiple vacas afetadas pelo calor.',               NULL,                              DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3,  41,  'Alerta: Frequencia cardiaca elevada',    'BR-0041 (Flor) — BPM 118 por 3 horas consecutivas. Acionar veterinario local.',                  NULL,                              DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Alertas de fazenda especifica (Farm 3 — Sao Bento)
(4,  70,  'Alerta: Parto iminente detectado',       'BR-0070 (Chuva) na Fazenda Sao Bento. Equipe de parto notificada.',                             DATE_SUB(NOW(), INTERVAL 3 HOUR),  DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(4,  73,  'Aviso: Colar com bateria baixa',         'collar-073 (BR-0073, Rio) — bateria em 6%. Substituicao programada para amanha.',                DATE_SUB(NOW(), INTERVAL 1 HOUR),  DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(6,  79,  'Alerta: Movimento reduzido detectado',   'BR-0079 (Prado) com imobilidade prolongada. Verificar in loco.',                                 NULL,                              DATE_SUB(NOW(), INTERVAL 45 MINUTE)),

-- Alertas de fazenda especifica (Farm 4 — Alvorada)
(5, 100,  'Alerta: Temperatura corporal anormal',   'BR-0100 (Rainha) na Fazenda Alvorada — temperatura de 40.0C por 2 leituras.',                   DATE_SUB(NOW(), INTERVAL 5 HOUR),  DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(3, 104,  'Alerta: Estresse termico detectado',     'BR-0104 (Luna) — grupo de vacas com sinais de estresse. Verificar bebedouros.',                  NULL,                              DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(6, 108,  'Aviso: Colar fora de cobertura',         'collar-108 (BR-0108, Bella) — sem sinal ha 1 hora. Checar gateway setor leste.',                 NULL,                              DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Alertas de fazenda especifica (Farm 5 — Esperanca)
(5, 132,  'Alerta: Parto iminente detectado',       'BR-0132 (Estrela) na Fazenda Esperanca. Temperatura em queda progressiva.',                     DATE_SUB(NOW(), INTERVAL 6 HOUR),  DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(4, 136,  'Alerta: Frequencia cardiaca elevada',    'BR-0136 (Morena) — BPM de 112 registrado. Monitorar nas proximas 2 horas.',                     DATE_SUB(NOW(), INTERVAL 2 HOUR),  DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(6, 142,  'Alerta: Movimento reduzido detectado',   'BR-0142 (Malhada) com queda brusca de atividade. Inspecionar animal.',                          NULL,                              DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Notificacoes sistemicas e de manutencao
(1, NULL, 'Sistema: Backup diario concluido',       'Backup automatico do banco de dados realizado com sucesso. 245 MB transferidos.',                DATE_SUB(NOW(), INTERVAL 1 HOUR),  DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, NULL, 'Sistema: Relatorio semanal disponivel',  'Relatorio de saude do rebanho da semana 20/2026 disponivel para download.',                      DATE_SUB(NOW(), INTERVAL 3 HOUR),  DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(1, NULL, 'Manutencao: Gateway reiniciado',         'Gateway da Fazenda Aurora reiniciado automaticamente apos falha de conexao.',                    DATE_SUB(NOW(), INTERVAL 6 HOUR),  DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(2, NULL, 'Alerta: 3 colares em manutencao',        'Os colares collar-183, collar-185, collar-189 estao em manutencao ha mais de 7 dias.',           NULL,                              DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(7, NULL, 'Financeiro: Relatorio mensal pronto',    'Relatorio financeiro de maio/2026 gerado. Custo medio por vaca: R$ 187,50.',                    DATE_SUB(NOW(), INTERVAL 1 DAY),   DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Historico adicional variado
(3,  12,  'Alerta: Parametros fora do normal',      'BR-0012 (Bonita) — dados inconsistentes. Sensor recalibrado.',                                   DATE_SUB(NOW(), INTERVAL 15 DAY),  DATE_SUB(NOW(), INTERVAL 15 DAY)),
(4,  35,  'Alerta: Movimento reduzido detectado',   'BR-0035 (Morena) — animal localizada deitada por muito tempo. Normal pos-parto.',                DATE_SUB(NOW(), INTERVAL 14 DAY),  DATE_SUB(NOW(), INTERVAL 14 DAY)),
(3,  67,  'Alerta: Frequencia cardiaca elevada',    'BR-0067 (Luna) — BPM elevado durante periodo de cio. Registrado e monitorado.',                  DATE_SUB(NOW(), INTERVAL 13 DAY),  DATE_SUB(NOW(), INTERVAL 13 DAY)),
(5,  82,  'Aviso: Colar com bateria baixa',         'collar-082 (BR-0082) — bateria trocada pelo operador de campo.',                                 DATE_SUB(NOW(), INTERVAL 11 DAY),  DATE_SUB(NOW(), INTERVAL 11 DAY)),
(6,  99,  'Alerta: Temperatura corporal anormal',   'BR-0099 (Colina) — febre 39.6C. Antibioticoerapia iniciada.',                                   DATE_SUB(NOW(), INTERVAL 16 DAY),  DATE_SUB(NOW(), INTERVAL 16 DAY)),
(3, 110,  'Alerta: Parto iminente detectado',       'BR-0110 (Rainha) — parto de gemeos registrado. Maes e bezerros sob observacao.',                 DATE_SUB(NOW(), INTERVAL 20 DAY),  DATE_SUB(NOW(), INTERVAL 20 DAY)),
(4, 125,  'Alerta: Estresse termico detectado',     'BR-0125 (Brisa) — onda de calor regional afetou 12 vacas da Farm 4.',                            DATE_SUB(NOW(), INTERVAL 18 DAY),  DATE_SUB(NOW(), INTERVAL 18 DAY)),
(5, 138,  'Aviso: Colar fora de cobertura',         'collar-138 — problema de firmware. Atualizacao OTA realizada com sucesso.',                      DATE_SUB(NOW(), INTERVAL 22 DAY),  DATE_SUB(NOW(), INTERVAL 22 DAY)),
(3, 148,  'Alerta: Frequencia cardiaca elevada',    'BR-0148 (Marrom) — taquicardia situacional. Resolucao espontanea confirmada.',                   DATE_SUB(NOW(), INTERVAL 25 DAY),  DATE_SUB(NOW(), INTERVAL 25 DAY)),
(6, 160,  'Alerta: Parametros fora do normal',      'BR-0160 (Vale) — ultima vaca da Farm 5 com sensor em falha. Substituicao agendada.',             DATE_SUB(NOW(), INTERVAL 28 DAY),  DATE_SUB(NOW(), INTERVAL 28 DAY));

-- ============================================================
-- RESUMO
-- ============================================================
SELECT 'permissions'       AS tabela, COUNT(*) AS total FROM permissions
UNION ALL
SELECT 'roles',             COUNT(*) FROM roles
UNION ALL
SELECT 'role_permissions',  COUNT(*) FROM role_permissions
UNION ALL
SELECT 'permission_groups', COUNT(*) FROM permission_groups
UNION ALL
SELECT 'users',             COUNT(*) FROM users
UNION ALL
SELECT 'farms',             COUNT(*) FROM farms
UNION ALL
SELECT 'collars',           COUNT(*) FROM collars
UNION ALL
SELECT 'cows',              COUNT(*) FROM cows
UNION ALL
SELECT 'heart_rate_data',   COUNT(*) FROM heart_rate_data
UNION ALL
SELECT 'temperature_data',  COUNT(*) FROM temperature_data
UNION ALL
SELECT 'accelerometer_data',COUNT(*) FROM accelerometer_data
UNION ALL
SELECT 'notifications',     COUNT(*) FROM notifications;