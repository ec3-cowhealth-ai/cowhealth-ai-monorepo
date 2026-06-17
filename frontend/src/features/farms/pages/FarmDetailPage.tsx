import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppBar } from "@components/layout";
import { LoadingSpinner, EmptyState } from "@components/common";
import { XCircle, Edit2, ChevronDown, Stethoscope } from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";
import { cowsService } from "@services/cowsService";
import { useFarm, useUpdateFarm } from "../hooks/useFarms";
import { useHasPermission } from "@hooks/usePermission";
import { PERMISSIONS } from "@config/permissions";
import { FarmForm } from "../components/FarmForm";
import {
  VeterinarianRequestModal,
  type VeterinarianRequestData,
} from "../components/VeterinarianRequestModal";

type SortBy = "name" | "id" | "status";

const COW_STATUS_ORDER: Record<string, number> = {
  HEALTHY: 1,
  CALVING: 2,
  HEAT_STRESS: 3,
  ALERT: 4,
  RETIRED: 5,
};

export const FarmDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [showVetRequest, setShowVetRequest] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const canEdit = useHasPermission(PERMISSIONS.UPDATE_FARM);
  const { data: farm, isLoading } = useFarm(id || "");
  const { mutate: updateFarm, isPending: updating } = useUpdateFarm();

  const { data: cows } = useQuery({
    queryKey: ["cows", { farmId: id }],
    queryFn: () => cowsService.list({ farmId: id }),
    enabled: !!id,
  });

  const handleVetRequest = (data: VeterinarianRequestData) => {
    // TODO: Implement backend API call for veterinarian request
    console.log("Veterinarian request submitted:", data);
    setShowVetRequest(false);
  };

  const farmCows = useMemo(() => {
    const list = cows ?? [];
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "name": {
          const nameA = (a.name || a.tag).toLowerCase();
          const nameB = (b.name || b.tag).toLowerCase();
          return nameA.localeCompare(nameB);
        }
        case "id":
          return String(a.tag).localeCompare(String(b.tag));
        case "status": {
          const orderA = COW_STATUS_ORDER[a.status] ?? 99;
          const orderB = COW_STATUS_ORDER[b.status] ?? 99;
          return orderA - orderB;
        }
        default:
          return 0;
      }
    });
  }, [cows, sortBy]);

  if (isLoading) {
    return (
      <div className="app-page">
        <AppBar title="Detalhes da Fazenda" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="app-page">
        <AppBar title="Detalhes da Fazenda" showBack />
        <EmptyState icon={<XCircle size={40} />} title="Fazenda não encontrada" />
      </div>
    );
  }

  return (
    <div className="app-page">
      <AppBar
        title={farm.name}
        showBack
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="app-bar__action"
              onClick={() => setShowVetRequest(true)}
              aria-label="Solicitar veterinário"
            >
              <Stethoscope size={18} />
            </button>
            {canEdit && (
              <button
                className="app-bar__action"
                aria-label="Editar fazenda"
                onClick={() => setShowEdit(true)}
              >
                <Edit2 size={18} />
              </button>
            )}
          </div>
        }
      />

      <div className="app-content">
        {/* Farm Info */}
        <div className="card">
          <h3
            style={{
              margin: "0 0 var(--s-3) 0",
              fontSize: "var(--t-h2)",
              fontWeight: 700,
            }}
          >
            Informações
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--s-3)",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 var(--s-1) 0",
                  fontSize: "var(--t-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                CNPJ
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--t-body)",
                  fontWeight: 600,
                }}
              >
                {farm.cnpj}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 var(--s-1) 0",
                  fontSize: "var(--t-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                Telefone
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--t-body)",
                  fontWeight: 600,
                }}
              >
                {farm.phone}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 var(--s-1) 0",
                  fontSize: "var(--t-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                Email
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--t-body)",
                  fontWeight: 600,
                }}
              >
                {farm.email}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 var(--s-1) 0",
                  fontSize: "var(--t-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                Localização
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--t-body)",
                  fontWeight: 600,
                }}
              >
                {farm.city}, {farm.state}
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: "var(--s-3)",
              paddingTop: "var(--s-3)",
              borderTop: "1px solid var(--border)",
            }}
          >
            <p
              style={{
                margin: "0 0 var(--s-1) 0",
                fontSize: "var(--t-sm)",
                color: "var(--text-secondary)",
              }}
            >
              Endereço
            </p>
            <p style={{ margin: 0, fontSize: "var(--t-body)" }}>{farm.address}</p>
          </div>
        </div>

        {/* Cows Section */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "var(--s-4) 0 var(--s-3) 0",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "var(--t-h2)",
                fontWeight: 700,
              }}
            >
              Vacas ({farmCows.length})
            </h3>
            {farmCows.length > 0 && (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    fontSize: "var(--t-sm)",
                    fontWeight: 500,
                    background: "var(--bg-elev-1)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    cursor: "pointer",
                    color: "var(--text-primary)",
                  }}
                >
                  Ordenar por:{" "}
                  <strong>{sortBy === "name" ? "Nome" : sortBy === "id" ? "ID" : "Status"}</strong>
                  <ChevronDown
                    size={16}
                    style={{ transform: showSortMenu ? "rotate(180deg)" : "" }}
                  />
                </button>
                {showSortMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: 4,
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      zIndex: 100,
                      minWidth: 160,
                    }}
                  >
                    {(["name", "id", "status"] as SortBy[]).map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setShowSortMenu(false);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "10px 16px",
                          textAlign: "left",
                          background: sortBy === option ? "var(--bg-elev-1)" : "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--text-primary)",
                          fontSize: "var(--t-sm)",
                          fontWeight: sortBy === option ? 600 : 400,
                          transition: "background 200ms",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--bg-elev-1)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            sortBy === option ? "var(--bg-elev-1)" : "transparent")
                        }
                      >
                        {option === "name" ? "Nome" : option === "id" ? "ID" : "Status"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {farmCows.length === 0 ? (
            <EmptyState
              icon={<CowHead size={40} />}
              title="Nenhuma vaca vinculada"
              description="Esta fazenda não possui vacas registradas."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 10,
              }}
            >
              {farmCows.map((cow) => {
                const statusColor = {
                  HEALTHY: "var(--status-success-color, #4CAF50)",
                  ALERT: "var(--status-danger-color, #F44336)",
                  HEAT_STRESS: "var(--status-warning-color, #FF9800)",
                  CALVING: "#6bb4e8",
                  RETIRED: "var(--text-secondary)",
                };
                const statusBg = {
                  HEALTHY: "var(--status-success-bg, rgba(76, 175, 80, 0.1))",
                  ALERT: "var(--status-danger-bg, rgba(244, 67, 54, 0.1))",
                  HEAT_STRESS: "var(--status-warning-bg, rgba(255, 152, 0, 0.1))",
                  CALVING: "rgba(107, 180, 232, 0.1)",
                  RETIRED: "var(--bg-elev-1)",
                };
                const statusLabel = {
                  HEALTHY: "Saudável",
                  ALERT: "Alerta",
                  HEAT_STRESS: "Est. Térmico",
                  CALVING: "Parto",
                  RETIRED: "Aposentado",
                };

                const cColor =
                  statusColor[cow.status as keyof typeof statusColor] || "var(--text-secondary)";
                const cBg = statusBg[cow.status as keyof typeof statusBg] || "var(--bg-elev-1)";
                const cLabel = statusLabel[cow.status as keyof typeof statusLabel] || cow.status;

                return (
                  <button
                    key={cow.id}
                    onClick={() => navigate(`/cows/${cow.id}`)}
                    style={{
                      padding: 14,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      transition: "all 200ms",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--status-success-color, #4CAF50)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: cBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CowHead size={22} color={cColor} />
                    </div>
                    <div style={{ minWidth: 0, width: "100%", textAlign: "center" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "var(--t-sm)",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cow.name || cow.tag}
                      </p>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: cBg,
                          color: cColor,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {cLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {canEdit && (
        <FarmForm
          open={showEdit}
          onClose={() => setShowEdit(false)}
          initialData={farm}
          onSubmit={(data) =>
            updateFarm(
              { id: String(farm.id), input: data },
              { onSuccess: () => setShowEdit(false) },
            )
          }
          isLoading={updating}
        />
      )}

      <VeterinarianRequestModal
        open={showVetRequest}
        farmName={farm.name}
        onClose={() => setShowVetRequest(false)}
        onSubmit={handleVetRequest}
      />
    </div>
  );
};
