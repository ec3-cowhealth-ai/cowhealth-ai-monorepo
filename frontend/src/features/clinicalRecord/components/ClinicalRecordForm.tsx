import { useState } from "react";
import type {
  CreateClinicalRecordInput,
  ClinicalStatus,
  ReproductiveStatus,
  ActivityLevel,
} from "../types";

interface Props {
  initial?: Partial<CreateClinicalRecordInput>;
  onSubmit: (data: CreateClinicalRecordInput) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const CLINICAL_STATUSES: { value: ClinicalStatus; label: string }[] = [
  { value: "STABLE", label: "Estável" },
  { value: "MONITORING", label: "Monitoramento" },
  { value: "CRITICAL", label: "Crítico" },
  { value: "RECOVERED", label: "Recuperado" },
  { value: "REFERRED", label: "Encaminhado" },
];

const REPRO_STATUSES: { value: ReproductiveStatus; label: string }[] = [
  { value: "OPEN", label: "Aberta" },
  { value: "INSEMINATED", label: "Inseminada" },
  { value: "PREGNANT", label: "Gestante" },
  { value: "DRY", label: "Seca" },
  { value: "POSTPARTUM", label: "Pós-parto" },
];

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: "Normal", label: "Normal" },
  { value: "Baixa", label: "Baixa" },
  { value: "Alta", label: "Alta" },
];

function toISOLocal(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString();
}

export default function ClinicalRecordForm({
  initial = {},
  onSubmit,
  isLoading,
  submitLabel = "Salvar",
}: Props) {
  const now = new Date().toISOString().slice(0, 16);

  const [form, setForm] = useState<Partial<CreateClinicalRecordInput>>({
    recordDate: initial.recordDate ? initial.recordDate.slice(0, 16) : now,
    clinicalStatus: initial.clinicalStatus ?? "STABLE",
    ...initial,
  });

  const set = (key: keyof CreateClinicalRecordInput, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateClinicalRecordInput = {
      ...form,
      recordDate: toISOLocal(form.recordDate as string),
      clinicalStatus: form.clinicalStatus!,
      lastCalvingDate: form.lastCalvingDate ? toISOLocal(form.lastCalvingDate) : undefined,
      expectedCalvingDate: form.expectedCalvingDate
        ? toISOLocal(form.expectedCalvingDate)
        : undefined,
      followUpDate: form.followUpDate ? toISOLocal(form.followUpDate) : undefined,
    };
    onSubmit(payload);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    background: "var(--bg-elev-1)",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    color: "inherit",
    fontSize: "0.9rem",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8rem",
    opacity: 0.65,
    marginBottom: "0.25rem",
  };

  const fieldStyle: React.CSSProperties = { marginBottom: "1rem" };

  const sectionStyle: React.CSSProperties = {
    marginBottom: "1.5rem",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    opacity: 0.5,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "0.75rem",
    marginTop: 0,
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "1rem",
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Cabeçalho */}
      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Informações Gerais</h3>
        <div style={gridStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Data do atendimento *</label>
            <input
              type="datetime-local"
              style={inputStyle}
              value={(form.recordDate as string) ?? ""}
              onChange={(e) => set("recordDate", e.target.value)}
              required
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Status clínico *</label>
            <select
              style={inputStyle}
              value={form.clinicalStatus ?? ""}
              onChange={(e) => set("clinicalStatus", e.target.value as ClinicalStatus)}
              required
            >
              {CLINICAL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Origem do alerta</label>
            <input
              type="text"
              style={inputStyle}
              value={form.alertOrigin ?? ""}
              onChange={(e) => set("alertOrigin", e.target.value || undefined)}
              placeholder="ex: Sensor, Observação"
            />
          </div>
        </div>
      </section>

      {/* Sinais vitais */}
      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Sinais Vitais</h3>
        <div style={gridStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Frequência cardíaca (bpm)</label>
            <input
              type="number"
              style={inputStyle}
              value={form.heartRate ?? ""}
              onChange={(e) =>
                set("heartRate", e.target.value ? Number(e.target.value) : undefined)
              }
              min={0}
              max={300}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>SpO₂ (%)</label>
            <input
              type="number"
              style={inputStyle}
              value={form.spo2 ?? ""}
              onChange={(e) => set("spo2", e.target.value ? Number(e.target.value) : undefined)}
              min={0}
              max={100}
              step={0.1}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Temperatura corporal (°C)</label>
            <input
              type="number"
              style={inputStyle}
              value={form.bodyTemperature ?? ""}
              onChange={(e) =>
                set("bodyTemperature", e.target.value ? Number(e.target.value) : undefined)
              }
              min={30}
              max={45}
              step={0.1}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Temperatura ambiente (°C)</label>
            <input
              type="number"
              style={inputStyle}
              value={form.ambientTemperature ?? ""}
              onChange={(e) =>
                set("ambientTemperature", e.target.value ? Number(e.target.value) : undefined)
              }
              step={0.1}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Nível de atividade</label>
            <select
              style={inputStyle}
              value={form.activityLevel ?? ""}
              onChange={(e) => set("activityLevel", e.target.value || undefined)}
            >
              <option value="">Não informado</option>
              {ACTIVITY_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Peso (kg)</label>
            <input
              type="number"
              style={inputStyle}
              value={form.weight ?? ""}
              onChange={(e) => set("weight", e.target.value ? Number(e.target.value) : undefined)}
              min={0}
              step={0.1}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Escore corporal (1–5)</label>
            <input
              type="number"
              style={inputStyle}
              value={form.bodyConditionScore ?? ""}
              onChange={(e) =>
                set("bodyConditionScore", e.target.value ? Number(e.target.value) : undefined)
              }
              min={1}
              max={5}
              step={0.25}
            />
          </div>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Notas de postura</label>
          <textarea
            style={inputStyle}
            rows={2}
            value={form.postureNotes ?? ""}
            onChange={(e) => set("postureNotes", e.target.value || undefined)}
          />
        </div>
      </section>

      {/* Avaliação clínica */}
      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Avaliação Clínica</h3>
        <div style={fieldStyle}>
          <label style={labelStyle}>Histórico de saúde</label>
          <textarea
            style={inputStyle}
            rows={3}
            value={form.healthHistory ?? ""}
            onChange={(e) => set("healthHistory", e.target.value || undefined)}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Sintomas atuais</label>
          <textarea
            style={inputStyle}
            rows={3}
            value={form.currentSymptoms ?? ""}
            onChange={(e) => set("currentSymptoms", e.target.value || undefined)}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Diagnóstico</label>
          <textarea
            style={inputStyle}
            rows={3}
            value={form.diagnosis ?? ""}
            onChange={(e) => set("diagnosis", e.target.value || undefined)}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Plano de tratamento</label>
          <textarea
            style={inputStyle}
            rows={3}
            value={form.treatmentPlan ?? ""}
            onChange={(e) => set("treatmentPlan", e.target.value || undefined)}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Notas de alimentação</label>
          <textarea
            style={inputStyle}
            rows={2}
            value={form.feedingNotes ?? ""}
            onChange={(e) => set("feedingNotes", e.target.value || undefined)}
          />
        </div>
      </section>

      {/* Medicamentos e procedimentos */}
      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Medicamentos e Procedimentos</h3>
        <div style={fieldStyle}>
          <label style={labelStyle}>Medicamentos administrados</label>
          <textarea
            style={inputStyle}
            rows={3}
            value={form.medicationsAdministered ?? ""}
            onChange={(e) => set("medicationsAdministered", e.target.value || undefined)}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Histórico de vacinação</label>
          <textarea
            style={inputStyle}
            rows={3}
            value={form.vaccinationHistory ?? ""}
            onChange={(e) => set("vaccinationHistory", e.target.value || undefined)}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Procedimentos cirúrgicos</label>
          <textarea
            style={inputStyle}
            rows={2}
            value={form.surgicalProcedures ?? ""}
            onChange={(e) => set("surgicalProcedures", e.target.value || undefined)}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Notas de alergias</label>
          <textarea
            style={inputStyle}
            rows={2}
            value={form.allergyNotes ?? ""}
            onChange={(e) => set("allergyNotes", e.target.value || undefined)}
          />
        </div>
      </section>

      {/* Status reprodutivo */}
      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Status Reprodutivo</h3>
        <div style={gridStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Status reprodutivo</label>
            <select
              style={inputStyle}
              value={form.reproductiveStatus ?? ""}
              onChange={(e) => set("reproductiveStatus", e.target.value || undefined)}
            >
              <option value="">Não informado</option>
              {REPRO_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Elegibilidade reprodutiva</label>
            <select
              style={inputStyle}
              value={form.breedingEligibility ?? ""}
              onChange={(e) => set("breedingEligibility", e.target.value || undefined)}
            >
              <option value="">Não informado</option>
              <option value="ELIGIBLE">Elegível</option>
              <option value="INELIGIBLE">Inelegível</option>
              <option value="PENDING">Pendente</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Status de estro</label>
            <select
              style={inputStyle}
              value={form.estrusStatus ?? ""}
              onChange={(e) => set("estrusStatus", e.target.value || undefined)}
            >
              <option value="">Não informado</option>
              <option value="IN_ESTRUS">Em estro</option>
              <option value="NOT_IN_ESTRUS">Fora do estro</option>
              <option value="UNKNOWN">Desconhecido</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Gestante</label>
            <select
              style={inputStyle}
              value={
                form.pregnancyStatus === undefined ? "" : form.pregnancyStatus ? "true" : "false"
              }
              onChange={(e) =>
                set(
                  "pregnancyStatus",
                  e.target.value === "" ? undefined : e.target.value === "true",
                )
              }
            >
              <option value="">Não informado</option>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Último parto</label>
            <input
              type="date"
              style={inputStyle}
              value={form.lastCalvingDate ? form.lastCalvingDate.slice(0, 10) : ""}
              onChange={(e) => set("lastCalvingDate", e.target.value || undefined)}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Parto previsto</label>
            <input
              type="date"
              style={inputStyle}
              value={form.expectedCalvingDate ? form.expectedCalvingDate.slice(0, 10) : ""}
              onChange={(e) => set("expectedCalvingDate", e.target.value || undefined)}
            />
          </div>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Janela de inseminação</label>
          <input
            type="text"
            style={inputStyle}
            value={form.inseminationWindow ?? ""}
            onChange={(e) => set("inseminationWindow", e.target.value || undefined)}
            placeholder="ex: 15/06 – 20/06"
          />
        </div>
      </section>

      {/* Acompanhamento */}
      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Acompanhamento e Notas</h3>
        <div style={fieldStyle}>
          <label style={labelStyle}>Recomendações veterinárias</label>
          <textarea
            style={inputStyle}
            rows={3}
            value={form.veterinaryRecommendations ?? ""}
            onChange={(e) => set("veterinaryRecommendations", e.target.value || undefined)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <input
            type="checkbox"
            id="followUpRequired"
            checked={form.followUpRequired ?? false}
            onChange={(e) => set("followUpRequired", e.target.checked)}
          />
          <label htmlFor="followUpRequired" style={{ cursor: "pointer" }}>
            Acompanhamento necessário
          </label>
        </div>
        {form.followUpRequired && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Data de acompanhamento</label>
            <input
              type="datetime-local"
              style={inputStyle}
              value={form.followUpDate ? form.followUpDate.slice(0, 16) : ""}
              onChange={(e) => set("followUpDate", e.target.value || undefined)}
            />
          </div>
        )}
        <div style={fieldStyle}>
          <label style={labelStyle}>Notas gerais</label>
          <textarea
            style={inputStyle}
            rows={3}
            value={form.generalNotes ?? ""}
            onChange={(e) => set("generalNotes", e.target.value || undefined)}
          />
        </div>
      </section>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Salvando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
