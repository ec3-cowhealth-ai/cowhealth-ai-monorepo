import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppBar } from "@components/layout";
import { LoadingSpinner, EmptyState } from "@components/common";
import { XCircle, Edit2 } from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";
import { cowsService } from "@services/cowsService";
import { useFarm, useUpdateFarm } from "../hooks/useFarms";
import { useMe } from "../../../hooks/useAuth";
import { FarmForm } from "../components/FarmForm";

export const FarmDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [showEdit, setShowEdit] = useState(false);

  const { data: me } = useMe();
  const { data: farm, isLoading } = useFarm(id || "");
  const { mutate: updateFarm, isPending: updating } = useUpdateFarm();

  const isSuperAdmin = me?.roles.some((r) => r.name === "SuperAdmin");
  const isFarmAdmin = me?.profile === "ADMIN" && String(me?.farmId) === id;
  const canEdit = isSuperAdmin || isFarmAdmin;

  const { data: cows } = useQuery({
    queryKey: ["cows", { farmId: id }],
    queryFn: () => cowsService.list({ farmId: id }),
    enabled: !!id,
  });

  const farmCows = cows ?? [];

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
          canEdit && (
            <button className="app-bar__action" onClick={() => setShowEdit(true)}>
              <Edit2 size={18} />
            </button>
          )
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
          <h3
            style={{
              margin: "var(--s-4) 0 var(--s-3) 0",
              fontSize: "var(--t-h2)",
              fontWeight: 700,
            }}
          >
            Vacas ({farmCows.length})
          </h3>

          {farmCows.length === 0 ? (
            <EmptyState
              icon={<CowHead size={40} />}
              title="Nenhuma vaca vinculada"
              description="Esta fazenda não possui vacas registradas."
            />
          ) : (
            <div className="grid grid--2">
              {farmCows.map((cow) => (
                <div key={cow.id} className="card">
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--t-body)",
                      fontWeight: 600,
                    }}
                  >
                    {cow.tag}
                  </p>
                  <p
                    style={{
                      margin: "var(--s-1) 0 0 0",
                      fontSize: "var(--t-sm)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Status: {cow.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {canEdit && (
        <FarmForm
          open={showEdit}
          onClose={() => setShowEdit(false)}
          initialData={farm}
          onSubmit={(data) => updateFarm({ id: String(farm.id), input: data }, { onSuccess: () => setShowEdit(false) })}
          isLoading={updating}
        />
      )}
    </div>
  );
};
