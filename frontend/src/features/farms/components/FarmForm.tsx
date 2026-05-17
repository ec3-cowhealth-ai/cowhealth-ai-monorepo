import { useState } from "react";
import { FormModal } from "@components/common";
import type { CreateFarmInput } from "../../../types/farms.ts";

interface FarmFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFarmInput) => void;
  isLoading?: boolean;
}

export const FarmForm = ({ open, onClose, onSubmit, isLoading }: FarmFormProps) => {
  const [formData, setFormData] = useState<CreateFarmInput>({
    name: "",
    cnpj: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    email: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: "",
      cnpj: "",
      address: "",
      city: "",
      state: "",
      phone: "",
      email: "",
    });
  };

  return (
    <FormModal
      open={open}
      title="Nova Fazenda"
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    >
      <div className="form-field">
        <label className="form-field__label is-required">Nome</label>
        <input
          type="text"
          className="form-field__input"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="form-field">
        <label className="form-field__label is-required">CNPJ</label>
        <input
          type="text"
          className="form-field__input"
          value={formData.cnpj}
          onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
          placeholder="00.000.000/0000-00"
          required
        />
      </div>

      <div className="form-field">
        <label className="form-field__label is-required">Endereço</label>
        <input
          type="text"
          className="form-field__input"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-3)" }}>
        <div className="form-field">
          <label className="form-field__label is-required">Cidade</label>
          <input
            type="text"
            className="form-field__input"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
        </div>

        <div className="form-field">
          <label className="form-field__label is-required">Estado</label>
          <input
            type="text"
            className="form-field__input"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            placeholder="SP"
            required
          />
        </div>
      </div>

      <div className="form-field">
        <label className="form-field__label is-required">Telefone</label>
        <input
          type="tel"
          className="form-field__input"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>

      <div className="form-field">
        <label className="form-field__label is-required">Email</label>
        <input
          type="email"
          className="form-field__input"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
    </FormModal>
  );
};
