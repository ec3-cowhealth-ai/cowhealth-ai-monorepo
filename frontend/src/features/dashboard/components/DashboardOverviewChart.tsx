/**
 * DashboardOverviewChart Component
 * TODO[IAN]: Implementar gráfico de visão geral
 *
 * Pode ser:
 * - Gráfico de linha (tendência ao longo do tempo)
 * - Gráfico de área
 * - Combinação de múltiplas métricas
 *
 * Recomendação: Usar biblioteca como Recharts ou Chart.js
 */

import type { ChartDataPoint } from '../types';

interface DashboardOverviewChartProps {
  data: ChartDataPoint[];
  title: string;
  period?: 'today' | 'week' | 'month';
}

export const DashboardOverviewChart = ({
  data,
  title,
  period = 'week',
}: DashboardOverviewChartProps) => {
  // TODO[IAN]: Implementar com Recharts ou similar:
  // ```
  // import { LineChart, Line, XAxis, YAxis } from 'recharts';
  //
  // return (
  //   <LineChart width={400} height={300} data={data}>
  //     <XAxis dataKey="label" />
  //     <YAxis />
  //     <Line type="monotone" dataKey="value" stroke="#8884d8" />
  //   </LineChart>
  // );
  // ```

  return (
    <div className="dashboard-chart">
      <h3>{title}</h3>
      <div className="chart-container">
        {/* TODO[IAN]: Adicionar gráfico aqui */}
        <p>Gráfico de {period}</p>
        <p>Dados: {JSON.stringify(data)}</p>
      </div>
    </div>
  );
};