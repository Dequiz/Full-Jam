import type { FormEvent } from "react";
import { PulseLoader } from "react-spinners";
import {
  TRANSACTION_CATEGORIES,
  type SaveTransactionPayload,
  type TransactionType,
} from "../../../service/cashFlowService.ts";

const secondaryButton =
  "inline-flex h-10 items-center justify-center rounded-[9px] border border-input-stroke bg-white px-4 text-sm font-semibold text-accent-color transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

const fieldClass =
  "mt-1 h-11 w-full rounded-[9px] border border-input-stroke bg-white px-3 text-sm text-[#1f2937] outline-none transition focus:border-accent-color focus:ring-2 focus:ring-blue-100";

type TransactionFormProps = {
  draft: SaveTransactionPayload;
  onChange: (draft: SaveTransactionPayload) => void;
  isEditing: boolean;
  isSubmitting: boolean;
  formError: string;
  onClose: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

const primaryButton =
  "inline-flex h-11 items-center justify-center rounded-[10px] bg-accent-color px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

export default function TransactionForm({
  draft,
  onChange,
  isEditing,
  isSubmitting,
  formError,
  onClose,
  onSave,
}: TransactionFormProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <form
        onSubmit={(e) => void onSave(e)}
        className="my-auto w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold">
              {isEditing ? "Editar movimentação" : "Nova movimentação"}
            </h2>
            <p className="text-secondary-text mt-1 text-xs">
              Informe os dados do lançamento financeiro.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fechar"
            className="text-secondary-text grid size-8 place-items-center rounded-lg text-xl hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <label className="text-secondary-text text-xs font-semibold sm:col-span-2">
            Descrição
            <input
              autoFocus
              required
              maxLength={100}
              value={draft.description}
              onChange={(e) =>
                onChange({ ...draft, description: e.target.value })
              }
              placeholder="Ex.: Venda de produtos"
              className={fieldClass}
            />
          </label>

          <label className="text-secondary-text text-xs font-semibold">
            Tipo
            <select
              value={draft.type}
              onChange={(e) => {
                const type = e.target.value as TransactionType;
                onChange({
                  ...draft,
                  type,
                  category: TRANSACTION_CATEGORIES[type][0],
                });
              }}
              className={fieldClass}
            >
              <option>Entrada</option>
              <option>Saída</option>
            </select>
          </label>

          <label className="text-secondary-text text-xs font-semibold">
            Categoria
            <select
              value={draft.category}
              onChange={(e) => onChange({ ...draft, category: e.target.value })}
              className={fieldClass}
            >
              {TRANSACTION_CATEGORIES[draft.type].map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="text-secondary-text text-xs font-semibold">
            Valor (R$)
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={draft.amount || ""}
              onChange={(e) =>
                onChange({ ...draft, amount: Number(e.target.value) })
              }
              placeholder="0,00"
              className={fieldClass}
            />
          </label>

          <label className="text-secondary-text text-xs font-semibold">
            Data
            <input
              required
              type="date"
              value={draft.date}
              onChange={(e) => onChange({ ...draft, date: e.target.value })}
              className={fieldClass}
            />
          </label>

          {formError && (
            <p
              role="alert"
              className="text-xs font-medium text-rose-600 sm:col-span-2"
            >
              {formError}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={secondaryButton}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={primaryButton}
          >
            {isSubmitting ? (
              <PulseLoader color="#ffffff" size={8} margin={2} />
            ) : isEditing ? (
              "Salvar alterações"
            ) : (
              "Adicionar lançamento"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
