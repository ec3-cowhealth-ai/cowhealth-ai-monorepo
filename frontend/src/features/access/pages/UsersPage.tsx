import { useState, useMemo } from "react";
import {
  FormModal,
  ConfirmDialog,
  EmptyState,
  ErrorState,
} from "@components/common";
import { X, User } from "lucide-react";
import {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useToggleActive,
  useAssignRole,
  useRemoveRole,
} from "../hooks/useUsers";
import { useRoles } from "../hooks/useRoles";
import type { UserListItem, UserProfile } from "../../../types/access.ts";

// ─── Helpers visuais ──────────────────────────────────────────────────────────

const PROFILE_LABEL: Record<UserProfile, string> = {
  ADMIN: "Admin",
  MANAGER: "Gestor",
  VIEWER: "Observador",
};

const PROFILE_CLASS: Record<UserProfile, string> = {
  ADMIN: "badge",
  MANAGER: "badge badge--warning",
  VIEWER: "badge badge--muted",
};

function avatarInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── Modal de criação ─────────────────────────────────────────────────────────

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  onSubmit: (data: {
    name: string;
    email: string;
    password: string;
    profile: UserProfile;
  }) => void;
}

function CreateUserModal({
  open,
  onClose,
  isLoading,
  onSubmit,
}: CreateModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    profile: "VIEWER" as UserProfile,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ name: "", email: "", password: "", profile: "VIEWER" });
  };

  return (
    <FormModal
      open={open}
      title="Novo Usuário"
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
        />
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">E-mail</label>
        <input
          type="email"
          className="form-field__input"
          value={form.email}
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">Senha</label>
        <input
          type="password"
          className="form-field__input"
          value={form.password}
          required
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">Perfil</label>
        <select
          className="form-field__select"
          value={form.profile}
          onChange={(e) =>
            setForm({ ...form, profile: e.target.value as UserProfile })
          }
        >
          <option value="VIEWER">Observador</option>
          <option value="MANAGER">Gestor</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
    </FormModal>
  );
}

// ─── Modal de edição ──────────────────────────────────────────────────────────

interface EditModalProps {
  user: UserListItem | null;
  onClose: () => void;
  isLoading: boolean;
  onSubmit: (data: {
    name: string;
    email: string;
    profile: UserProfile;
  }) => void;
}

function EditUserModal({ user, onClose, isLoading, onSubmit }: EditModalProps) {
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    profile: (user?.profile ?? "VIEWER") as UserProfile,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!user) return null;

  return (
    <FormModal
      open
      title="Editar Usuário"
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
        />
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">E-mail</label>
        <input
          type="email"
          className="form-field__input"
          value={form.email}
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">Perfil</label>
        <select
          className="form-field__select"
          value={form.profile}
          onChange={(e) =>
            setForm({ ...form, profile: e.target.value as UserProfile })
          }
        >
          <option value="VIEWER">Observador</option>
          <option value="MANAGER">Gestor</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
    </FormModal>
  );
}

// ─── Modal de papéis ──────────────────────────────────────────────────────────

interface RolesModalProps {
  userId: string;
  onClose: () => void;
}

function ManageRolesModal({ userId, onClose }: RolesModalProps) {
  const { data: user, isLoading } = useUser(userId);
  const { data: allRoles } = useRoles();
  const { mutate: assign, isPending: assigning } = useAssignRole();
  const { mutate: remove, isPending: removing } = useRemoveRole();
  const [selectedRole, setSelectedRole] = useState("");

  const userRoleIds = useMemo(
    () => new Set((user?.roles ?? []).map((r) => String(r.id))),
    [user],
  );

  const availableRoles = useMemo(
    () => (allRoles ?? []).filter((r) => !userRoleIds.has(String(r.id))),
    [allRoles, userRoleIds],
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-card__header">
          <h2 className="modal-card__title">Papéis do usuário</h2>
          <button className="modal-card__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-card__body">
          {isLoading ? (
            <p style={{ color: "var(--text-muted)", fontSize: "var(--t-sm)" }}>
              Carregando...
            </p>
          ) : (
            <>
              {/* Papéis atuais */}
              <div>
                <p
                  style={{
                    margin: "0 0 var(--s-2)",
                    fontSize: "var(--t-sm)",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  Papéis atribuídos
                </p>
                {(user?.roles ?? []).length === 0 ? (
                  <p
                    style={{
                      fontSize: "var(--t-sm)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Nenhum papel atribuído.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "var(--s-2)",
                    }}
                  >
                    {(user?.roles ?? []).map((role) => (
                      <span
                        key={role.id}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "var(--s-1)",
                          padding: "4px 10px",
                          borderRadius: "var(--r-full)",
                          background: "var(--primary-soft)",
                          color: "var(--accent)",
                          fontSize: "var(--t-sm)",
                          fontWeight: 600,
                        }}
                      >
                        {role.name}
                        <button
                          onClick={() =>
                            remove({ userId, roleId: String(role.id) })
                          }
                          disabled={removing}
                          style={{
                            background: "none",
                            border: "none",
                            color: "inherit",
                            cursor: "pointer",
                            padding: 0,
                            lineHeight: 1,
                            opacity: 0.7,
                            display: "flex",
                          }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Adicionar papel */}
              {availableRoles.length > 0 && (
                <div>
                  <p
                    style={{
                      margin: "0 0 var(--s-2)",
                      fontSize: "var(--t-sm)",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                  >
                    Adicionar papel
                  </p>
                  <div style={{ display: "flex", gap: "var(--s-2)" }}>
                    <select
                      className="form-field__select"
                      style={{ flex: 1 }}
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <option value="">Selecionar papel...</option>
                      {availableRoles.map((r) => (
                        <option key={r.id} value={String(r.id)}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn btn-primary"
                      disabled={!selectedRole || assigning}
                      onClick={() => {
                        if (selectedRole) {
                          assign({ userId, roleId: selectedRole });
                          setSelectedRole("");
                        }
                      }}
                    >
                      Atribuir
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-card__footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [managingRolesUserId, setManagingRolesUserId] = useState<string | null>(
    null,
  );
  const [togglingUser, setTogglingUser] = useState<UserListItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserListItem | null>(null);

  const { data: users, isLoading, isError } = useUsers();
  const { mutate: createUser, isPending: creating } = useCreateUser();
  const { mutate: updateUser, isPending: updating } = useUpdateUser();
  const { mutate: deleteUser, isPending: deleting } = useDeleteUser();
  const { mutate: toggleActive } = useToggleActive();

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  if (isLoading) {
    return (
      <div style={{ marginTop: "var(--s-4)" }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="loading-skeleton"
            style={{
              height: 56,
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
        title="Erro ao carregar usuários"
        description="Não foi possível carregar a lista."
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
      {/* Barra de ações */}
      <div style={{ display: "flex", gap: "var(--s-3)", alignItems: "center" }}>
        <div className="form-field" style={{ flex: 1, margin: 0 }}>
          <input
            className="form-field__input"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate(true)}
        >
          + Novo usuário
        </button>
      </div>

      {/* Conteúdo */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<User size={40} />}
          title="Nenhum usuário encontrado"
          description={
            search
              ? "Tente outro termo de busca."
              : "Crie o primeiro usuário do sistema."
          }
          action={
            !search ? (
              <button
                className="btn btn-primary"
                onClick={() => setShowCreate(true)}
              >
                Criar usuário
              </button>
            ) : undefined
          }
        />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  {/* Nome + e-mail com avatar */}
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--s-3)",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "var(--r-full)",
                          background: "var(--primary-soft)",
                          color: "var(--accent)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "var(--t-sm)",
                          flexShrink: 0,
                        }}
                      >
                        {avatarInitials(user.name)}
                      </div>
                      <div>
                        <div
                          style={{ fontWeight: 600, fontSize: "var(--t-body)" }}
                        >
                          {user.name}
                        </div>
                        <div
                          style={{
                            fontSize: "var(--t-sm)",
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Perfil */}
                  <td>
                    <span className={PROFILE_CLASS[user.profile]}>
                      {PROFILE_LABEL[user.profile]}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span
                      className={`status-badge ${user.isActive ? "status-badge--success" : "status-badge--muted"}`}
                    >
                      <span className="status-badge__dot" />
                      {user.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>

                  {/* Ações */}
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
                        onClick={() => setManagingRolesUserId(String(user.id))}
                      >
                        Papéis
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setEditingUser(user)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setTogglingUser(user)}
                      >
                        {user.isActive ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeletingUser(user)}
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
      <CreateUserModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        isLoading={creating}
        onSubmit={(data) =>
          createUser(data, { onSuccess: () => setShowCreate(false) })
        }
      />

      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        isLoading={updating}
        onSubmit={(data) =>
          updateUser(
            { id: String(editingUser!.id), input: data },
            { onSuccess: () => setEditingUser(null) },
          )
        }
      />

      {managingRolesUserId && (
        <ManageRolesModal
          userId={managingRolesUserId}
          onClose={() => setManagingRolesUserId(null)}
        />
      )}

      <ConfirmDialog
        open={!!togglingUser}
        title={togglingUser?.isActive ? "Desativar usuário" : "Ativar usuário"}
        description={`Deseja ${togglingUser?.isActive ? "desativar" : "ativar"} o usuário "${togglingUser?.name}"?`}
        confirmLabel={togglingUser?.isActive ? "Desativar" : "Ativar"}
        isDangerous={togglingUser?.isActive}
        onConfirm={() =>
          toggleActive(String(togglingUser!.id), {
            onSuccess: () => setTogglingUser(null),
          })
        }
        onCancel={() => setTogglingUser(null)}
      />

      <ConfirmDialog
        open={!!deletingUser}
        title="Excluir usuário"
        description={`Tem certeza que deseja excluir "${deletingUser?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel={deleting ? "Excluindo..." : "Excluir"}
        isDangerous
        onConfirm={() =>
          deleteUser(String(deletingUser!.id), {
            onSuccess: () => setDeletingUser(null),
          })
        }
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  );
};
