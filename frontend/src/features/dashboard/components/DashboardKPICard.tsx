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
  const trendClass =
    trend === 'up'
      ? 'kpi-card__change--positive'
      : trend === 'down'
      ? 'kpi-card__change--negative'
      : '';

  const trendArrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div className="kpi-card">
      <p className="kpi-card__label">{title}</p>
      <p className="kpi-card__value">
        {value}
        {unit && <span className="kpi-card__unit">{unit}</span>}
      </p>
      {trend && (
        <p className={`kpi-card__change ${trendClass}`}>
          {trendArrow}
          {trendPercent !== undefined && ` ${Math.abs(trendPercent)}%`}
        </p>
      )}
    </div>
  );
};