import { useQuery } from "@tanstack/react-query";
import { permissionsService } from "@services/permissionsService";
import { LoadingSpinner, EmptyState } from "@components/common";

export const PermissionsPage = () => {
  const { data: permissions, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => permissionsService.list(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ marginTop: "var(--s-4)" }}>
      {permissions && permissions.length === 0 ? (
        <EmptyState icon="🔑" title="Nenhuma permissão" description="Nenhuma permissão registrada." />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {permissions?.map((perm) => (
              <tr key={perm.id}>
                <td>{perm.name}</td>
                <td>{perm.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
