import { useState, useMemo } from "react";
import {
  FormModal,
  ConfirmDialog,
  EmptyState,
  ErrorState,
} from "@components/common";
import { Key } from "lucide-react";
import {
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from "../hooks/usePermissions";
import type { Permission } from "../../../types/access.ts";

// ─── Modal criar / editar permissao ──────────────────────────────────────────

interface PermissionFormModalProps {
  open: boolean;
  permission?: Permission | null;
  onClose: () => void;
  isLoading: boolean;
  onSubmit: (data: { name: string; description: string }) => void;
}

function PermissionFormModal({
  open,
  permission,
  onClose,
  isLoading,
  onSubmit,
}: PermissionFormModalProps) {
  const [form, setForm] = useState({
    name: permission?.name ?? "",
    description: permission?.description ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    if (!permission) setForm({ name: "", description: "" });
  };

  return (
    <FormModal
      open={open}
      title={permission ? "Editar permissao" : "Nova permissao"}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    >
      <div className="form-field">
        <label className="form-field__label is-required">Nome</label>
        <input
          className="form-field__input"
          value={form.name}
          required
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Ex: ViewAny Cow"
        />
        <p className="form-field__hint">
          Convencao recomendada: Acao + Recurso (ex: Create Farm, Delete Cow)
        </p>
      </div>
      <div className="form-field">
        <label className="form-field__label">Descricao</label>
        <input
          className="form-field__input"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descricao opcional"
        />
      </div>
    </FormModal>
  );
}

// ─── Pagina principal ─────────────────────────────────────────────────────────

export const PermissionsPage = () => {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [deletingPerm, setDeletingPerm] = useState<Permission | null>(null);

  const { data: permissions, isLoading, isError } = usePermissions();
  const { mutate: createPermission, isPending: creating } =
    useCreatePermission();
  const { mutate: updatePermission, isPending: updating } =
    useUpdatePermission();
  const { mutate: deletePermission, isPending: deleting } =
    useDeletePermission();

  const filtered = useMemo(() => {
    if (!permissions) return [];
    const q = search.toLowerCase();
    return permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q),
    );
  }, [permissions, search]);

  if (isLoading) {
    return (
      <div style={{ marginTop: "var(--s-4)" }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="loading-skeleton"
            style={{
              height: 48,
              marginBottom: "var(--s-2)",
              borderRadius: "var(--r-md)",
            }}
          />
        ))}
      </div>
    );
  }

  if (isError)
    return (
      <ErrorState
        title="Erro ao carregar permissoes"
        description="Nao foi possivel carregar a lista."
      />
    );

  return (
    <div
      style={{
        marginTop: "var(--s-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--s-3)",
      }}
    >
      {/* Barra de acoes */}
      <div style={{ display: "flex", gap: "var(--s-3)", alignItems: "center" }}>
        <div className="form-field" style={{ flex: 1, margin: 0 }}>
          <input
            className="form-field__input"
            placeholder="Buscar permissao..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate(true)}
        >
          + Nova permissao
        </button>
      </div>

      {/* Conteudo */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Key size={40} />}
          title="Nenhuma permissao encontrada"
          description={
            search
              ? "Tente outro termo de busca."
              : "Crie a primeira permissao do sistema."
          }
          action={
            !search ? (
              <button
                className="btn btn-primary"
                onClick={() => setShowCreate(true)}
              >
                Criar permissao
              </button>
            ) : undefined
          }
        />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descricao</th>
                <th style={{ textAlign: "right" }}>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((perm) => (
                <tr key={perm.id}>
                  <td>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--t-sm)",
                        color: "var(--accent)",
                        fontWeight: 500,
                      }}
                    >
                      {perm.name}
                    </span>
                  </td>
                  <td
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "var(--t-sm)",
                    }}
                  >
                    {perm.description ?? (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--s-2)",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setEditingPerm(perm)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeletingPerm(perm)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modais */}
      <PermissionFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        isLoading={creating}
        onSubmit={(data) =>
          createPermission(data, { onSuccess: () => setShowCreate(false) })
        }
      />

      {editingPerm && (
        <PermissionFormModal
          open
          permission={editingPerm}
          onClose={() => setEditingPerm(null)}
          isLoading={updating}
          onSubmit={(data) =>
            updatePermission(
              { id: String(editingPerm.id), input: data },
              { onSuccess: () => setEditingPerm(null) },
            )
          }
        />
      )}

      <ConfirmDialog
        open={!!deletingPerm}
        title="Excluir permissao"
        description={`Tem certeza que deseja excluir a permissao "${deletingPerm?.name}"? Ela nao pode estar vinculada a papeis ou grupos.`}
        confirmLabel={deleting ? "Excluindo..." : "Excluir"}
        isDangerous
        onConfirm={() =>
          deletePermission(String(deletingPerm!.id), {
            onSuccess: () => setDeletingPerm(null),
          })
        }
        onCancel={() => setDeletingPerm(null)}
      />
    </div>
  );
};
