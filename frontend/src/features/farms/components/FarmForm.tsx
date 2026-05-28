import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormModal } from "@components/common";
import type { CreateFarmInput } from "@/types/farms";

const farmSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  address: z.string().min(3, "Endereço obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "Use a sigla do estado (ex: SP)"),
  phone: z.string().min(8, "Telefone obrigatório"),
  email: z.string().email("Email inválido"),
});

interface FarmFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFarmInput) => void;
  isLoading?: boolean;
  initialData?: Partial<CreateFarmInput>;
}

export const FarmForm = ({ open, onClose, onSubmit, isLoading, initialData }: FarmFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFarmInput>({
    resolver: zodResolver(farmSchema),
    values: initialData as CreateFarmInput | undefined,
  });

  const onValid = (data: CreateFarmInput) => {
    onSubmit(data);
    reset();
  };

  return (
    <FormModal
      open={open}
      title="Nova Fazenda"
      onClose={onClose}
      onSubmit={handleSubmit(onValid)}
      isLoading={isLoading}
    >
      <div className="form-field">
        <label className="form-field__label is-required">Nome</label>
        <input type="text" className="form-field__input" {...register("name")} />
        {errors.name && (
          <span style={{ color: "var(--danger)", fontSize: "var(--t-sm)" }}>
            {errors.name.message}
          </span>
        )}
      </div>

      <div className="form-field">
        <label className="form-field__label is-required">CNPJ</label>
        <input
          type="text"
          className="form-field__input"
          placeholder="00.000.000/0000-00"
          {...register("cnpj")}
        />
        {errors.cnpj && (
          <span style={{ color: "var(--danger)", fontSize: "var(--t-sm)" }}>
            {errors.cnpj.message}
          </span>
        )}
      </div>

      <div className="form-field">
        <label className="form-field__label is-required">Endereço</label>
        <input type="text" className="form-field__input" {...register("address")} />
        {errors.address && (
          <span style={{ color: "var(--danger)", fontSize: "var(--t-sm)" }}>
            {errors.address.message}
          </span>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--s-3)",
        }}
      >
        <div className="form-field">
          <label className="form-field__label is-required">Cidade</label>
          <input type="text" className="form-field__input" {...register("city")} />
          {errors.city && (
            <span style={{ color: "var(--danger)", fontSize: "var(--t-sm)" }}>
              {errors.city.message}
            </span>
          )}
        </div>

        <div className="form-field">
          <label className="form-field__label is-required">Estado</label>
          <input
            type="text"
            className="form-field__input"
            placeholder="SP"
            maxLength={2}
            {...register("state")}
          />
          {errors.state && (
            <span style={{ color: "var(--danger)", fontSize: "var(--t-sm)" }}>
              {errors.state.message}
            </span>
          )}
        </div>
      </div>

      <div className="form-field">
        <label className="form-field__label is-required">Telefone</label>
        <input type="tel" className="form-field__input" {...register("phone")} />
        {errors.phone && (
          <span style={{ color: "var(--danger)", fontSize: "var(--t-sm)" }}>
            {errors.phone.message}
          </span>
        )}
      </div>

      <div className="form-field">
        <label className="form-field__label is-required">Email</label>
        <input type="email" className="form-field__input" {...register("email")} />
        {errors.email && (
          <span style={{ color: "var(--danger)", fontSize: "var(--t-sm)" }}>
            {errors.email.message}
          </span>
        )}
      </div>
    </FormModal>
  );
};
