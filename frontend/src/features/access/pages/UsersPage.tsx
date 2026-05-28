import { useState, useMemo } from "react";
import { FormModal, ConfirmDialog, EmptyState, ErrorState } from "@components/common";
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
import { useFarms } from "../../farms/hooks/useFarms";
import { useMe } from "@hooks/useAuth";
import type { UserListItem, UserProfile } from "@/types/access";
import "../../../styles/access.css";

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

function normalizeEmailPattern(farmName: string): string {
  return farmName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
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
    farmId?: number;
    roleId?: number;
  }) => void;
}

function CreateUserModal({ open, onClose, isLoading, onSubmit }: CreateModalProps) {
  const { data: me } = useMe();
  const { data: farms } = useFarms();
  const { data: roles } = useRoles();

  const isSuperAdmin = useMemo(
    () => me?.roles.some((r) => r.name === "SuperAdmin") || false,
    [me],
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    profile: "VIEWER" as UserProfile,
    farmId: "" as string | number,
    roleId: "" as string | number,
  });


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      farmId: form.farmId ? Number(form.farmId) : undefined,
      roleId: form.roleId ? Number(form.roleId) : undefined,
    });
    setForm({
      name: "",
      email: "",
      password: "",
      profile: "VIEWER",
      farmId: "",
      roleId: "",
    });
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

      {isSuperAdmin && (
        <div className="form-field">
          <label className="form-field__label is-required">Fazenda</label>
          <select
            className="form-field__select"
            value={form.farmId}
            required
            onChange={(e) => {
              const newFarmId = e.target.value;
              const farm = farms?.find((f) => String(f.id) === newFarmId);
              const domain = farm ? normalizeEmailPattern(farm.name) : "";
              const prefix = form.email.split("@")[0] || "";
              setForm({ ...form, farmId: newFarmId, email: domain ? `${prefix}@${domain}.com` : form.email });
            }}
          >
            <option value="">Selecionar fazenda...</option>
            {farms?.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      )}

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
        <label className="form-field__label is-required">Papel Principal</label>
        <select
          className="form-field__select"
          value={form.roleId}
          required
          onChange={(e) => setForm({ ...form, roleId: e.target.value })}
        >
          <option value="">Selecionar papel...</option>
          {roles?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label className="form-field__label is-required">Perfil (Nível de Acesso)</label>
        <select
          className="form-field__select"
          value={form.profile}
          onChange={(e) => setForm({ ...form, profile: e.target.value as UserProfile })}
        >
          <option value="VIEWER">Observador (Leitura)</option>
          <option value="MANAGER">Gestor (CRUD)</option>
          {isSuperAdmin && <option value="ADMIN">Admin da Fazenda</option>}
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
  onSubmit: (data: { name: string; email: string; profile: UserProfile; farmId?: number }) => void;
}

function EditUserModal({ user, onClose, isLoading, onSubmit }: EditModalProps) {
  const { data: me } = useMe();
  const { data: farms } = useFarms();

  const isSuperAdmin = useMemo(
    () => me?.roles.some((r) => r.name === "SuperAdmin") || false,
    [me],
  );

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    profile: (user?.profile ?? "VIEWER") as UserProfile,
    farmId: user?.farmId ?? ("" as string | number),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      farmId: form.farmId ? Number(form.farmId) : undefined,
    });
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

      {isSuperAdmin && (
        <div className="form-field">
          <label className="form-field__label is-required">Fazenda</label>
          <select
            className="form-field__select"
            value={form.farmId}
            required
            onChange={(e) => setForm({ ...form, farmId: e.target.value })}
          >
            <option value="">Selecionar fazenda...</option>
            {farms?.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      )}

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
          onChange={(e) => setForm({ ...form, profile: e.target.value as UserProfile })}
        >
          <option value="VIEWER">Observador</option>
          <option value="MANAGER">Gestor</option>
          {isSuperAdmin && <option value="ADMIN">Admin</option>}
        </select>
      </div>
    </FormModal>
  );
}

// ─── Modal de papéis ──────────────────────────────────────────────────────────

interface RolesModalProps {
  userId: number;
  onClose: () => void;
}

function ManageRolesModal({ userId, onClose }: RolesModalProps) {
  const { data: user, isLoading } = useUser(String(userId));
  const { data: allRoles } = useRoles();
  const { mutate: assign, isPending: assigning } = useAssignRole();
  const { mutate: remove, isPending: removing } = useRemoveRole();
  const [selectedRole, setSelectedRole] = useState("");

  const userRoleIds = useMemo(() => new Set((user?.roles ?? []).map((r) => String(r.id))), [user]);

  const availableRoles = useMemo(
    () => (allRoles ?? []).filter((r) => !userRoleIds.has(String(r.id))),
    [allRoles, userRoleIds],
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <h2 className="modal-card__title">Papéis do usuário</h2>
          <button className="modal-card__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-card__body">
          {isLoading ? (
            <p className="text-muted text-sm">Carregando...</p>
          ) : (
            <>
              {/* Papéis atuais */}
              <div className="roles-modal__section">
                <p className="roles-modal__label">Papéis atribuídos</p>
                {(user?.roles ?? []).length === 0 ? (
                  <p className="text-sm text-muted">Nenhum papel atribuído.</p>
                ) : (
                  <div className="roles-list">
                    {(user?.roles ?? []).map((role) => (
                      <span key={role.id} className="role-badge">
                        {role.name}
                        <button
                          onClick={() => remove({ userId: String(userId), roleId: String(role.id) })}
                          disabled={removing}
                          className="role-badge__remove"
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
                <div className="roles-modal__section">
                  <p className="roles-modal__label">Adicionar papel</p>
                  <div className="role-add-row">
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
                          assign({ userId: String(userId), roleId: selectedRole });
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
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
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
  const [managingRolesUserId, setManagingRolesUserId] = useState<number | null>(null);
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
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.farm?.name ?? "").toLowerCase().includes(q),
    );
  }, [users, search]);

  if (isLoading) {
    return (
      <div className="access-container">
        {[1, 2, 3].map((i) => (
          <div key={i} className="loading-skeleton user-skeleton" />
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
    <div className="access-container">
      {/* Barra de ações */}
      <div className="access-actions">
        <div className="form-field access-search">
          <input
            className="form-field__input"
            placeholder="Buscar por nome, e-mail ou fazenda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          + Novo usuário
        </button>
      </div>

      {/* Conteúdo */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<User size={40} />}
          title="Nenhum usuário encontrado"
          description={
            search ? "Tente outro termo de busca." : "Crie o primeiro usuário do sistema."
          }
          action={
            !search ? (
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
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
                  {/* Nome + e-mail com avatar e fazenda */}
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{avatarInitials(user.name)}</div>
                      <div>
                        <div className="user-info__name">{user.name}</div>
                        <div className="user-info__email">{user.email}</div>
                        {user.farm && <div className="user-info__farm">{user.farm.name}</div>}
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
                    <div className="actions-cell">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setManagingRolesUserId(user.id)}
                      >
                        Papéis
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={() => setEditingUser(user)}>
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
        onSubmit={(data) => createUser(data, { onSuccess: () => setShowCreate(false) })}
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
