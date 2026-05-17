import { useQuery } from "@tanstack/react-query";
import { usersService } from "@services/usersService";
import { LoadingSpinner, EmptyState } from "@components/common";

export const UsersPage = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersService.list(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ marginTop: "var(--s-4)" }}>
      {users && users.length === 0 ? (
        <EmptyState icon="👤" title="Nenhum usuário" description="Nenhum usuário registrado." />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.profile}</td>
                <td>{user.isActive ? "Ativo" : "Inativo"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
