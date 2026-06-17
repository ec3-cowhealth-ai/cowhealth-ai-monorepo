import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { FormModal, ConfirmDialog, EmptyState, ErrorState } from "@components/common";
import { X, Users } from "lucide-react";
import {
  useRoles,
  useRole,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useGrantPermission,
  useRevokePermission,
} from "../hooks/useRoles";
import { usePermissions } from "../hooks/usePermissions";
import type { RoleListItem } from "@/types/access";

// ─── Modal criar / editar papel ───────────────────────────────────────────────

interface RoleFormModalProps {
  open: boolean;
  role?: RoleListItem | null;
  onClose: () => void;
  isLoading: boolean;
  onSubmit: (data: { name: string; description: string }) => void;
}

function RoleFormModal({ open, role, onClose, isLoading, onSubmit }: RoleFormModalProps) {
  const [form, setForm] = useState({
    name: role?.name ?? "",
    description: role?.description ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    if (!role) setForm({ name: "", description: "" });
  };

  return (
    <FormModal
      open={open}
      title={role ? "Editar papel" : "Novo papel"}
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
          placeholder="Ex: Veterinario"
        />
      </div>
      <div className="form-field">
        <label className="form-field__label">Descricao</label>
        <input
          className="form-field__input"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descricao opcional do papel"
        />
      </div>
    </FormModal>
  );
}

// ─── Modal de gerenciamento de permissoes ─────────────────────────────────────

interface ManagePermsModalProps {
  roleId: number;
  roleName: string;
  onClose: () => void;
}

function ManagePermissionsModal({ roleId, roleName, onClose }: ManagePermsModalProps) {
  const { data: roleDetail, isLoading } = useRole(String(roleId));
  const { data: allPermissions } = usePermissions();
  const { mutate: grant, isPending: granting } = useGrantPermission();
  const { mutate: revoke, isPending: revoking } = useRevokePermission();
  const [optimisticToggles, setOptimisticToggles] = useState<Set<string>>(new Set());

  const grantedIds = useMemo(
    () => new Set((roleDetail?.permissions ?? []).map((p) => String(p.permission.id))),
    [roleDetail],
  );

  const isPending = granting || revoking;

  const togglePermission = useCallback(
    (permId: number) => {
      if (isPending) return;
      const permIdStr = String(permId);

      // Otimistic update
      setOptimisticToggles((prev) => {
        const next = new Set(prev);
        if (next.has(permIdStr)) {
          next.delete(permIdStr);
        } else {
          next.add(permIdStr);
        }
        return next;
      });

      // API call
      if (grantedIds.has(permIdStr)) {
        revoke({ roleId: String(roleId), permissionId: permIdStr });
      } else {
        grant({ roleId: String(roleId), permissionId: permIdStr });
      }
    },
    [isPending, grantedIds, roleId, grant, revoke],
  );

  const effectiveGrants = useMemo(() => {
    const base = new Set(grantedIds);
    optimisticToggles.forEach((id) => {
      if (base.has(id)) {
        base.delete(id);
      } else {
        base.add(id);
      }
    });
    return base;
  }, [grantedIds, optimisticToggles]);

  const prevIsPendingRef = useRef(isPending);

  useEffect(() => {
    if (prevIsPendingRef.current && !isPending) {
      setOptimisticToggles(new Set());
    }
    prevIsPendingRef.current = isPending;
  }, [isPending]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <div>
            <h2 className="modal-card__title">Permissoes</h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "var(--t-sm)",
                color: "var(--text-muted)",
              }}
            >
              Papel: <strong style={{ color: "var(--text-primary)" }}>{roleName}</strong>
            </p>
          </div>
          <button className="modal-card__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-card__body">
          {isLoading || !allPermissions ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--s-2)",
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="loading-skeleton"
                  style={{ height: 44, borderRadius: "var(--r-sm)" }}
                />
              ))}
            </div>
          ) : allPermissions.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "var(--t-sm)" }}>
              Nenhuma permissao cadastrada no sistema.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--s-1)",
                maxHeight: 360,
                overflowY: "auto",
              }}
            >
              {allPermissions.map((perm) => {
                const active = effectiveGrants.has(String(perm.id));
                return (
                  <label
                    key={perm.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--s-3)",
                      padding: "var(--s-3)",
                      borderRadius: "var(--r-sm)",
                      cursor: isPending ? "not-allowed" : "pointer",
                      background: active ? "var(--primary-soft)" : "var(--bg-elev-2)",
                      border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
                      transition: "background 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      disabled={isPending}
                      onChange={() => togglePermission(perm.id)}
                      style={{
                        accentColor: "var(--primary)",
                        width: 16,
                        height: 16,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "var(--t-body)",
                          fontWeight: 600,
                          color: active ? "var(--accent)" : "var(--text-primary)",
                        }}
                      >
                        {perm.name}
                      </div>
                      {perm.description && (
                        <div
                          style={{
                            fontSize: "var(--t-xs)",
                            color: "var(--text-muted)",
                            marginTop: 2,
                          }}
                        >
                          {perm.description}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-card__footer">
          <button className="btn btn-primary" onClick={onClose} style={{ flex: 1 }}>
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pagina principal ─────────────────────────────────────────────────────────

export const RolesPage = () => {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleListItem | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleListItem | null>(null);
  const [managingPermsRole, setManagingPermsRole] = useState<RoleListItem | null>(null);

  const { data: roles, isLoading, isError } = useRoles();
  const { mutate: createRole, isPending: creating } = useCreateRole();
  const { mutate: updateRole, isPending: updating } = useUpdateRole();
  const { mutate: deleteRole, isPending: deleting } = useDeleteRole();

  const filtered = useMemo(() => {
    if (!roles) return [];
    const q = search.toLowerCase();
    return roles.filter((r) => r.name.toLowerCase().includes(q));
  }, [roles, search]);

  if (isLoading) {
    return (
      <div
        style={{
          marginTop: "var(--s-4)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "var(--s-3)",
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="loading-skeleton"
            style={{ height: 140, borderRadius: "var(--r-md)" }}
          />
        ))}
      </div>
    );
  }

  if (isError)
    return (
      <ErrorState
        title="Erro ao carregar papeis"
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
            placeholder="Buscar papel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          + Novo papel
        </button>
      </div>

      {/* Grid de cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={40} />}
          title="Nenhum papel encontrado"
          description={search ? "Tente outro termo de busca." : "Crie o primeiro papel de acesso."}
          action={
            !search ? (
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                Criar papel
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid--2">
          {filtered.map((role) => (
            <div
              key={role.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--s-3)",
              }}
            >
              {/* Cabecalho */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "var(--s-2)",
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--t-body)",
                      fontWeight: 700,
                    }}
                  >
                    {role.name}
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      gap: "var(--s-1)",
                      flexShrink: 0,
                    }}
                  >
                    <button
                      className="btn btn-sm btn-ghost"
                      style={{ height: 28, padding: "0 var(--s-2)" }}
                      onClick={() => setEditingRole(role)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      style={{ height: 28, padding: "0 var(--s-2)" }}
                      onClick={() => setDeletingRole(role)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
                {role.description && (
                  <p
                    style={{
                      margin: "var(--s-1) 0 0",
                      fontSize: "var(--t-sm)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {role.description}
                  </p>
                )}
              </div>

              {/* Contadores */}
              <div style={{ display: "flex", gap: "var(--s-2)" }}>
                <span className="badge">{role._count.permissions} permissao(oes)</span>
                <span className="badge badge--muted">{role._count.users} usuario(s)</span>
              </div>

              {/* Gerenciar permissoes */}
              <button
                className="btn btn-secondary btn-sm btn-full"
                onClick={() => setManagingPermsRole(role)}
              >
                Gerenciar permissoes
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modais */}
      <RoleFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        isLoading={creating}
        onSubmit={(data) => createRole(data, { onSuccess: () => setShowCreate(false) })}
      />

      {editingRole && (
        <RoleFormModal
          open
          role={editingRole}
          onClose={() => setEditingRole(null)}
          isLoading={updating}
          onSubmit={(data) =>
            updateRole(
              { id: String(editingRole.id), input: data },
              { onSuccess: () => setEditingRole(null) },
            )
          }
        />
      )}

      {managingPermsRole && (
        <ManagePermissionsModal
          roleId={managingPermsRole.id}
          roleName={managingPermsRole.name}
          onClose={() => setManagingPermsRole(null)}
        />
      )}

      <ConfirmDialog
        open={!!deletingRole}
        title="Excluir papel"
        description={`Tem certeza que deseja excluir o papel "${deletingRole?.name}"? Ele nao pode ter usuarios vinculados.`}
        confirmLabel={deleting ? "Excluindo..." : "Excluir"}
        isDangerous
        onConfirm={() =>
          deleteRole(String(deletingRole!.id), {
            onSuccess: () => setDeletingRole(null),
          })
        }
        onCancel={() => setDeletingRole(null)}
      />
    </div>
  );
};
