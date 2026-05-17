/**
 * CowsPerStatusChart Component
 * TODO[IAN]: Implementar gráfico de vacas por status de saúde
 *
 * Tipos esperados:
 * - "healthy" | "at-risk" | "sick"
 *
 * Recomendação: Usar gráfico de pizza (Pie Chart) ou barra
 */

import type { ChartDataPoint } from '../types';

interface CowsPerStatusChartProps {
  data: ChartDataPoint[];
}

export const CowsPerStatusChart = ({ data }: CowsPerStatusChartProps) => {
  // TODO[IAN]: Implementar com Recharts Pie Chart:
  // ```
  // import { PieChart, Pie, Cell } from 'recharts';
  //
  // const COLORS = {
  //   healthy: '#10b981',
  //   'at-risk': '#f59e0b',
  //   sick: '#ef4444'
  // };
  //
  // return (
  //   <PieChart width={400} height={400}>
  //     <Pie data={data} dataKey="value" label>
  //       {data.map((entry, index) => (
  //         <Cell key={`cell-${index}`} fill={COLORS[entry.label] || '#ccc'} />
  //       ))}
  //     </Pie>
  //   </PieChart>
  // );
  // ```

  return (
    <div className="chart-container">
      <h3>Vacas por Status</h3>
      <p>Gráfico de pizza com status de saúde</p>
      <ul>
        {data.map((point) => (
          <li key={point.label}>
            {point.label}: {point.value}
          </li>
        ))}
      </ul>
    </div>
  );
};