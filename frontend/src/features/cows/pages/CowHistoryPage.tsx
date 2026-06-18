import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppBar } from "@components/layout";
import { LoadingSpinner } from "@components/common";
import { cowsService } from "@services/cowsService";

interface SensorHistoryRow {
  measuredAt: string;
  heartRate: number | null;
  temperature: number | null;
  activity: number | null;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

const exportCsv = (rows: SensorHistoryRow[]) => {
  const header = "Data/Hora,Temperatura (°C),FC (bpm),Atividade (m/s²)";
  const lines = rows.map((r) =>
    [formatDate(r.measuredAt), r.temperature ?? "", r.heartRate ?? "", r.activity ?? ""].join(","),
  );
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "historico-sensores.csv";
  a.click();
  URL.revokeObjectURL(url);
};

export const CowHistoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [applied, setApplied] = useState<{ from: string; to: string }>({ from: "", to: "" });

  const { data, isLoading } = useQuery<SensorHistoryRow[]>({
    queryKey: ["cows", id, "sensor-history", applied],
    queryFn: () =>
      cowsService.getSensorHistory(id!, applied.from || undefined, applied.to || undefined),
    enabled: !!id,
  });

  return (
    <div className="app-page">
      <AppBar title="Histórico de Sensores" showBack />

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Filtros */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="form-field" style={{ margin: 0 }}>
            <label className="form-field__label">De</label>
            <input
              type="date"
              className="form-field__input"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="form-field" style={{ margin: 0 }}>
            <label className="form-field__label">Até</label>
            <input
              type="date"
              className="form-field__input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setApplied({ from, to })}>
            Aplicar
          </button>
          {data && data.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => exportCsv(data)}>
              Exportar CSV
            </button>
          )}
        </div>

        {/* Tabela */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <LoadingSpinner />
          </div>
        ) : !data || data.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 14 }}
          >
            Nenhuma leitura encontrada no período selecionado.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Temperatura (°C)</th>
                  <th>FC (bpm)</th>
                  <th>Atividade (m/s²)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    <td>{formatDate(row.measuredAt)}</td>
                    <td>{row.temperature != null ? row.temperature.toFixed(1) : "—"}</td>
                    <td>{row.heartRate != null ? row.heartRate : "—"}</td>
                    <td>{row.activity != null ? row.activity.toFixed(3) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
