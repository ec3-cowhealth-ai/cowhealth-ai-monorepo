/**
 * CowsPerFarmChart Component
 * TODO[IAN]: Implementar gráfico de vacas por fazenda
 *
 * Tipo: Gráfico de barra horizontal ou vertical
 * Mostra: Distribuição de vacas entre as diferentes fazendas
 */

import type { ChartDataPoint } from '../types';

interface CowsPerFarmChartProps {
  data: ChartDataPoint[];
}

export const CowsPerFarmChart = ({ data }: CowsPerFarmChartProps) => {
  // TODO[IAN]: Implementar com Recharts Bar Chart:
  // ```
  // import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
  //
  // return (
  //   <BarChart width={500} height={300} data={data}>
  //     <CartesianGrid strokeDasharray="3 3" />
  //     <XAxis dataKey="label" />
  //     <YAxis />
  //     <Tooltip />
  //     <Bar dataKey="value" fill="#3b82f6" />
  //   </BarChart>
  // );
  // ```

  return (
    <div className="chart-container">
      <h3>Vacas por Fazenda</h3>
      <p>Gráfico de barras com distribuição por fazenda</p>
      <table>
        <thead>
          <tr>
            <th>Fazenda</th>
            <th>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.label}>
              <td>{point.label}</td>
              <td>{point.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};