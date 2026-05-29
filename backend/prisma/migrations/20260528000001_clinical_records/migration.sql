-- ============================================================
-- Fase 1: Novos campos em Cow
-- ============================================================

ALTER TABLE `cows`
  ADD COLUMN `lactation_number`      INT          NULL,
  ADD COLUMN `last_calving_date`     DATETIME(3)  NULL,
  ADD COLUMN `expected_calving_date` DATETIME(3)  NULL,
  ADD COLUMN `reproductive_status`   ENUM('OPEN','INSEMINATED','PREGNANT','DRY','POSTPARTUM') NULL,
  ADD COLUMN `sire`                  VARCHAR(191) NULL;

-- ============================================================
-- Fase 2: Novos campos em Notification
-- ============================================================

ALTER TABLE `notifications`
  ADD COLUMN `severity`   ENUM('HIGH','MEDIUM','LOW') NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN `alert_type` VARCHAR(64) NULL;

-- ============================================================
-- Fase 3: Tabela activity_events
-- ============================================================

CREATE TABLE `activity_events` (
  `id`           INT AUTO_INCREMENT NOT NULL,
  `cow_id`       INT NOT NULL,
  `type`         ENUM('RUMINATION','FEEDING','RESTING','LOW_ACTIVITY','HIGH_ACTIVITY','WALKING') NOT NULL,
  `started_at`   DATETIME(3) NOT NULL,
  `duration_min` INT NOT NULL,
  `created_at`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `activity_events_cow_id_started_at_idx` (`cow_id`, `started_at`),
  CONSTRAINT `activity_events_cow_id_fkey`
    FOREIGN KEY (`cow_id`) REFERENCES `cows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- Fase 4: Tabela cow_clinical_records (prontuário completo)
-- ============================================================

CREATE TABLE `cow_clinical_records` (
  `id`                          INT AUTO_INCREMENT NOT NULL,
  `cow_id`                      INT NOT NULL,
  `veterinarian_id`             INT NOT NULL,
  `record_date`                 DATETIME(3) NOT NULL,

  -- Avaliação geral
  `clinical_status`             ENUM('STABLE','MONITORING','CRITICAL','RECOVERED','REFERRED') NOT NULL,
  `alert_origin`                VARCHAR(64) NULL,

  -- Sinais vitais
  `heart_rate`                  INT NULL,
  `spo2`                        DOUBLE NULL,
  `body_temperature`            DOUBLE NULL,
  `ambient_temperature`         DOUBLE NULL,
  `activity_level`              VARCHAR(32) NULL,
  `posture_notes`               LONGTEXT NULL,

  -- Biometria
  `weight`                      DOUBLE NULL,
  `body_condition_score`        DOUBLE NULL,

  -- Alimentação
  `feeding_notes`               LONGTEXT NULL,

  -- Avaliação clínica
  `health_history`              LONGTEXT NULL,
  `current_symptoms`            LONGTEXT NULL,
  `diagnosis`                   LONGTEXT NULL,
  `treatment_plan`              LONGTEXT NULL,

  -- Medicamentos e procedimentos
  `medications_administered`    LONGTEXT NULL,
  `vaccination_history`         LONGTEXT NULL,
  `surgical_procedures`         LONGTEXT NULL,
  `allergy_notes`               LONGTEXT NULL,

  -- Status reprodutivo
  `reproductive_status`         ENUM('OPEN','INSEMINATED','PREGNANT','DRY','POSTPARTUM') NULL,
  `breeding_eligibility`        ENUM('ELIGIBLE','INELIGIBLE','PENDING') NULL,
  `estrus_status`               ENUM('IN_ESTRUS','NOT_IN_ESTRUS','UNKNOWN') NULL,
  `insemination_window`         VARCHAR(191) NULL,
  `pregnancy_status`            TINYINT(1) NULL,
  `last_calving_date`           DATETIME(3) NULL,
  `expected_calving_date`       DATETIME(3) NULL,

  -- Acompanhamento
  `veterinary_recommendations`  LONGTEXT NULL,
  `follow_up_required`          TINYINT(1) NOT NULL DEFAULT 0,
  `follow_up_date`              DATETIME(3) NULL,

  -- Notas + soft delete
  `general_notes`               LONGTEXT NULL,
  `deleted_at`                  DATETIME(3) NULL,

  `created_at`                  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`                  DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `cow_clinical_records_cow_id_record_date_idx` (`cow_id`, `record_date`),
  INDEX `cow_clinical_records_veterinarian_id_idx` (`veterinarian_id`),
  CONSTRAINT `cow_clinical_records_cow_id_fkey`
    FOREIGN KEY (`cow_id`) REFERENCES `cows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cow_clinical_records_veterinarian_id_fkey`
    FOREIGN KEY (`veterinarian_id`) REFERENCES `users`(`id`) ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
