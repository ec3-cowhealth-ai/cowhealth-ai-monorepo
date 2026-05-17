interface SensorChartProps {
  data: Array<{ timestamp: string; value: number }>;
  title: string;
  unit: string;
  minThreshold?: number;
  maxThreshold?: number;
}

export const SensorChart = ({
  data,
  title,
  unit,
  minThreshold,
  maxThreshold,
}: SensorChartProps) => {
  // Placeholder chart - replace with Recharts when dependency is installed
  const avgValue = data.length > 0
    ? (data.reduce((sum, p) => sum + p.value, 0) / data.length).toFixed(1)
    : "N/A";

  const minValue = data.length > 0
    ? Math.min(...data.map((p) => p.value)).toFixed(1)
    : "N/A";

  const maxValue = data.length > 0
    ? Math.max(...data.map((p) => p.value)).toFixed(1)
    : "N/A";

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
      <h4
        style={{
          margin: 0,
          fontSize: "var(--t-body)",
          fontWeight: 600,
        }}
      >
        {title}
      </h4>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--s-2)" }}>
        <div className="kpi-card">
          <p className="kpi-card__label">Mínimo</p>
          <p className="kpi-card__value" style={{ color: "var(--text-primary)" }}>
            {minValue}
            <span className="kpi-card__unit">{unit}</span>
          </p>
          {minThreshold && (
            <p className="kpi-card__change kpi-card__change--positive">
              Limite: {minThreshold}
            </p>
          )}
        </div>

        <div className="kpi-card">
          <p className="kpi-card__label">Média</p>
          <p className="kpi-card__value" style={{ color: "var(--text-primary)" }}>
            {avgValue}
            <span className="kpi-card__unit">{unit}</span>
          </p>
        </div>

        <div className="kpi-card">
          <p className="kpi-card__label">Máximo</p>
          <p className="kpi-card__value" style={{ color: "var(--text-primary)" }}>
            {maxValue}
            <span className="kpi-card__unit">{unit}</span>
          </p>
          {maxThreshold && (
            <p className="kpi-card__change kpi-card__change--negative">
              Limite: {maxThreshold}
            </p>
          )}
        </div>
      </div>

      <div style={{ fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
        <p>Dados dos últimos 7 dias ({data.length} registros)</p>
      </div>
    </div>
  );
};
