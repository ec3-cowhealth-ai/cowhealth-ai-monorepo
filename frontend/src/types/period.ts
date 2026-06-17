export type Period = "hourly" | "daily" | "weekly" | "biweekly" | "monthly" | "yearly" | "custom";

export interface PeriodConfig {
  value: Period;
  label: string;
  /** Número de dias equivalentes (usado para sensor hooks que aceitam `days`) */
  days: number;
}

export const PERIOD_OPTIONS: PeriodConfig[] = [
  { value: "hourly", label: "Horário", days: 1 },
  { value: "daily", label: "Diário", days: 7 },
  { value: "weekly", label: "Semanal", days: 56 },
  { value: "biweekly", label: "Quinzenal", days: 90 },
  { value: "monthly", label: "Mensal", days: 365 },
  { value: "yearly", label: "Anual", days: 1825 },
  { value: "custom", label: "Personalizar", days: 0 },
];
