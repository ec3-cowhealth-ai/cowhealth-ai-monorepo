/**
 * DashboardKPICard Component
 * TODO[IAN]: Implementar card com KPI (Key Performance Indicator)
 *
 * Props esperadas:
 * - title: string (ex: "Vacas Saudáveis")
 * - value: number
 * - unit?: string (ex: "%", "unidades")
 * - trend?: 'up' | 'down' | 'neutral'
 * - trendPercent?: number
 */

interface DashboardKPICardProps {
  title: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendPercent?: number;
}

export const DashboardKPICard = ({
  title,
  value,
  unit = '',
  trend,
  trendPercent,
}: DashboardKPICardProps) => {
  // TODO[IAN]: Implementar card bonito com:
  // - Ícone apropriado baseado no title
  // - Indicador de tendência (seta para cima/baixo)
  // - Estilo visual consistente com design system
  // - Responsivo em mobile

  return (
    <div className="dashboard-kpi-card">
      <h3>{title}</h3>
      <div className="value">
        {value}
        <span className="unit">{unit}</span>
      </div>
      {trend && (
        <div className={`trend ${trend}`}>
          {/* TODO[IAN]: Adicionar ícone de seta/tendência */}
          {trend === 'up' && '📈'}
          {trend === 'down' && '📉'}
          {trend === 'neutral' && '➡️'}
          {trendPercent && <span>{Math.abs(trendPercent)}%</span>}
        </div>
      )}
    </div>
  );
};