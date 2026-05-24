import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppBar } from "@components/layout";
import { LoadingSpinner, EmptyState } from "@components/common";
import { XCircle, createLucideIcon } from "lucide-react";
import { cowHead } from "@lucide/lab";

const CowHead = createLucideIcon("CowHead", cowHead);
import { cowsService } from "@services/cowsService";
import { useFarm } from "../hooks/useFarms";

export const FarmDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: farm, isLoading } = useFarm(id || "");

  const { data: cows } = useQuery({
    queryKey: ["cows", { farmId: id }],
    queryFn: () => cowsService.list({ farmId: id }),
    enabled: !!id,
  });

  // API ja filtra por farmId — usar cows direto
  const farmCows = cows ?? [];

  if (isLoading) {
    return (
      <div className="app-page">
        <AppBar title="Detalhes da Fazenda" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="app-page">
        <AppBar title="Detalhes da Fazenda" />
        <EmptyState icon={<XCircle size={40} />} title="Fazenda não encontrada" />
      </div>
    );
  }

  return (
    <div className="app-page">
      <AppBar title={farm.name} />

      <div className="app-page__section">
        {/* Farm Info */}
        <div className="card">
          <h3 style={{ margin: "0 0 var(--s-3) 0", fontSize: "var(--t-h2)", fontWeight: 700 }}>
            Informações
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-3)" }}>
            <div>
              <p style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
                CNPJ
              </p>
              <p style={{ margin: 0, fontSize: "var(--t-body)", fontWeight: 600 }}>
                {farm.cnpj}
              </p>
            </div>

            <div>
              <p style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
                Telefone
              </p>
              <p style={{ margin: 0, fontSize: "var(--t-body)", fontWeight: 600 }}>
                {farm.phone}
              </p>
            </div>

            <div>
              <p style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
                Email
              </p>
              <p style={{ margin: 0, fontSize: "var(--t-body)", fontWeight: 600 }}>
                {farm.email}
              </p>
            </div>

            <div>
              <p style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
                Localização
              </p>
              <p style={{ margin: 0, fontSize: "var(--t-body)", fontWeight: 600 }}>
                {farm.city}, {farm.state}
              </p>
            </div>
          </div>

          <div style={{ marginTop: "var(--s-3)", paddingTop: "var(--s-3)", borderTop: "1px solid var(--border)" }}>
            <p style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
              Endereço
            </p>
            <p style={{ margin: 0, fontSize: "var(--t-body)" }}>
              {farm.address}
            </p>
          </div>
        </div>

        {/* Cows Section */}
        <div>
          <h3 style={{ margin: "var(--s-4) 0 var(--s-3) 0", fontSize: "var(--t-h2)", fontWeight: 700 }}>
            Vacas ({farmCows.length})
          </h3>

          {farmCows.length === 0 ? (
            <EmptyState icon={<CowHead size={40} />} title="Nenhuma vaca vinculada" description="Esta fazenda não possui vacas registradas." />
          ) : (
            <div className="grid grid--2">
              {farmCows.map((cow) => (
                <div key={cow.id} className="card">
                  <p style={{ margin: 0, fontSize: "var(--t-body)", fontWeight: 600 }}>
                    {cow.tag}
                  </p>
                  <p style={{ margin: "var(--s-1) 0 0 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
                    Status: {cow.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
