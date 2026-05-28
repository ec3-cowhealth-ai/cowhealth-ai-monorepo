/**
 * Dashboard Feature Types
 * TODO[IAN]: Expandir com tipos específicos para gráficos
 */

export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface DashboardData {
  totalCows: number;
  healthyCows: number;
  unhealthyCows: number;
  totalFarms: number;
  cowsPerStatus: ChartDataPoint[];
  cowsPerFarm: ChartDataPoint[];
  // TODO[IAN]: Adicionar mais dados conforme necessário
  // - temperatura média
  // - alertas recentes
  // - atividade dos últimos 7 dias
  // - status de coleiras
}

export interface DashboardOverview {
  period: "today" | "week" | "month";
  data: DashboardData;
}
