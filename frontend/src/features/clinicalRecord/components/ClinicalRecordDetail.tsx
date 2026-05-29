import type { ClinicalRecord, ClinicalStatus, ReproductiveStatus } from "../types";

const STATUS_LABEL: Record<ClinicalStatus, string> = {
  STABLE: "Estável",
  MONITORING: "Monitoramento",
  CRITICAL: "Crítico",
  RECOVERED: "Recuperado",
  REFERRED: "Encaminhado",
};

const STATUS_CLASS: Record<ClinicalStatus, string> = {
  STABLE: "status-badge--success",
  MONITORING: "status-badge--warning",
  CRITICAL: "status-badge--danger",
  RECOVERED: "status-badge--info",
  REFERRED: "status-badge--muted",
};

const REPRO_LABEL: Record<ReproductiveStatus, string> = {
  OPEN: "Aberta",
  INSEMINATED: "Inseminada",
  PREGNANT: "Gestante",
  DRY: "Seca",
  POSTPARTUM: "Pós-parto",
};

interface FieldProps {
  label: string;
  value: string | number | boolean | null | undefined;
}

function Field({ label, value }: FieldProps) {
  if (value === null || value === undefined || value === "") return null;
  const display = typeof value === "boolean" ? (value ? "Sim" : "Não") : String(value);
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <div style={{ fontSize: "0.75rem", opacity: 0.6, marginBottom: "0.15rem" }}>{label}</div>
      <div style={{ whiteSpace: "pre-wrap" }}>{display}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "1.5rem" }}>
      <h3 style={{ fontSize: "0.875rem", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

interface Props {
  record: ClinicalRecord;
}

export default function ClinicalRecordDetail({ record }: Props) {
  const date = new Date(record.recordDate).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontSize: "0.875rem", opacity: 0.6 }}>Data do atendimento</div>
          <div style={{ fontWeight: 600 }}>{date}</div>
          <div style={{ fontSize: "0.875rem", opacity: 0.6, marginTop: "0.25rem" }}>
            Dr(a). {record.veterinarian.name}
          </div>
        </div>
        <span className={`status-badge ${STATUS_CLASS[record.clinicalStatus]}`}>
          {STATUS_LABEL[record.clinicalStatus]}
        </span>
      </div>

      <Section title="Sinais Vitais">
        <Field label="Frequência cardíaca (bpm)" value={record.heartRate} />
        <Field label="SpO₂ (%)" value={record.spo2} />
        <Field label="Temperatura corporal (°C)" value={record.bodyTemperature} />
        <Field label="Temperatura ambiente (°C)" value={record.ambientTemperature} />
        <Field label="Nível de atividade" value={record.activityLevel} />
        <Field label="Notas de postura" value={record.postureNotes} />
      </Section>

      <Section title="Biometria">
        <Field label="Peso (kg)" value={record.weight} />
        <Field label="Escore de condição corporal" value={record.bodyConditionScore} />
      </Section>

      <Section title="Avaliação Clínica">
        <Field label="Origem do alerta" value={record.alertOrigin} />
        <Field label="Histórico de saúde" value={record.healthHistory} />
        <Field label="Sintomas atuais" value={record.currentSymptoms} />
        <Field label="Diagnóstico" value={record.diagnosis} />
        <Field label="Plano de tratamento" value={record.treatmentPlan} />
      </Section>

      <Section title="Medicamentos e Procedimentos">
        <Field label="Medicamentos administrados" value={record.medicationsAdministered} />
        <Field label="Histórico de vacinação" value={record.vaccinationHistory} />
        <Field label="Procedimentos cirúrgicos" value={record.surgicalProcedures} />
        <Field label="Notas de alergias" value={record.allergyNotes} />
      </Section>

      <Section title="Status Reprodutivo">
        <Field label="Status reprodutivo" value={record.reproductiveStatus ? REPRO_LABEL[record.reproductiveStatus] : null} />
        <Field label="Elegível para reprodução" value={record.breedingEligibility} />
        <Field label="Status de estro" value={record.estrusStatus} />
        <Field label="Janela de inseminação" value={record.inseminationWindow} />
        <Field label="Gestante" value={record.pregnancyStatus} />
        <Field label="Último parto" value={record.lastCalvingDate ? new Date(record.lastCalvingDate).toLocaleDateString("pt-BR") : null} />
        <Field label="Parto previsto" value={record.expectedCalvingDate ? new Date(record.expectedCalvingDate).toLocaleDateString("pt-BR") : null} />
        <Field label="Alimentação" value={record.feedingNotes} />
      </Section>

      <Section title="Acompanhamento e Notas">
        <Field label="Recomendações veterinárias" value={record.veterinaryRecommendations} />
        <Field label="Acompanhamento necessário" value={record.followUpRequired} />
        <Field label="Data de acompanhamento" value={record.followUpDate ? new Date(record.followUpDate).toLocaleDateString("pt-BR") : null} />
        <Field label="Notas gerais" value={record.generalNotes} />
      </Section>
    </div>
  );
}
