import { useQuery } from "@tanstack/react-query";
import { rolesService } from "@services/rolesService";
import { LoadingSpinner, EmptyState } from "@components/common";

export const RolesPage = () => {
  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesService.list(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ marginTop: "var(--s-4)" }}>
      {roles && roles.length === 0 ? (
        <EmptyState icon="🎭" title="Nenhum papel" description="Nenhum papel registrado." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--s-3)" }}>
          {roles?.map((role) => (
            <div key={role.id} className="card">
              <h4 style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-body)", fontWeight: 600 }}>
                {role.name}
              </h4>
              <p style={{ margin: "0 0 var(--s-2) 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
                {role.description}
              </p>
              <p style={{ margin: 0, fontSize: "var(--t-sm)", color: "var(--text-muted)" }}>
                {role.permissions.length} permissão(ões)
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
