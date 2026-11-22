import { useMemo, useState } from "react";
import type { Transaction } from "../../../service/cashFlowService.ts";
import EditButton from "../../../core/EditButton.tsx";
import DeleteButton from "../../../core/DeleteButton.tsx";
import { dateLabel, money } from "./cashFlowFormat";
import { LoadingState, LoadErrorState } from "./CashFlowStates";

type TransactionHistoryProps = {
  periodTransactions: Transaction[];
  isOwner: boolean;
  isLoading: boolean;
  loadError: string | null;
  onRetry: () => void;
  onNew: () => void;
  onEdit: (item: Transaction) => void;
  onDelete: (id: string) => void;
};

export default function TransactionHistory({
  periodTransactions,
  isOwner,
  isLoading,
  loadError,
  onRetry,
  onNew,
  onEdit,
  onDelete,
}: TransactionHistoryProps) {
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.toLocaleLowerCase("pt-BR");

    return periodTransactions
      .filter((item) => {
        const matchesType = typeFilter === "Todos" || item.type === typeFilter;
        const text = `${item.description} ${item.category}`;
        return matchesType && text.toLocaleLowerCase("pt-BR").includes(query);
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [periodTransactions, typeFilter, search]);

  const tableHeadings = [
    "Descrição",
    "Categoria",
    "Data",
    "Tipo",
    "Valor",
    ...(isOwner ? ["Ações"] : []),
  ];

  return (
    <section className="border-input-stroke overflow-hidden rounded-[15px] border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7ebf3] p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold">Histórico de movimentações</h2>
          <p className="text-secondary-text mt-1 text-xs">
            {filtered.length}{" "}
            {filtered.length === 1
              ? "lançamento encontrado"
              : "lançamentos encontrados"}
          </p>
        </div>

        <select
          aria-label="Filtrar tipo"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border-input-stroke focus:border-accent-color h-10 rounded-lg border bg-white px-3 text-xs outline-none"
        >
          <option>Todos</option>
          <option>Entrada</option>
          <option>Saída</option>
        </select>
      </div>

      <div className="border-b border-[#e7ebf3] p-4 sm:px-6">
        <label className="border-input-stroke text-secondary-text flex h-10 max-w-[420px] items-center gap-2 rounded-lg border px-3">
          <span className="text-lg">⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descrição ou categoria"
            aria-label="Buscar por descrição ou categoria"
            className="placeholder:text-secondary-text w-full bg-transparent text-xs text-[#1f2937] outline-none"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <LoadingState />
        ) : loadError ? (
          <LoadErrorState message={loadError} onRetry={onRetry} />
        ) : (
          <>
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Histórico de movimentações financeiras
              </caption>
              <thead className="bg-accent-color text-xs font-semibold text-white">
                <tr>
                  {tableHeadings.map((heading) => (
                    <th key={heading} className="px-5 py-4">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-[#e7ebf3] transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4 font-semibold">
                      {item.description}
                    </td>
                    <td className="text-secondary-text px-5 py-4">
                      {item.category}
                    </td>
                    <td className="text-secondary-text px-5 py-4">
                      {dateLabel(item.date)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          item.type === "Entrada"
                            ? "bg-emerald-50 text-emerald-900"
                            : "bg-rose-50 text-rose-900"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td
                      className={`px-5 py-4 font-semibold tabular-nums ${
                        item.type === "Entrada"
                          ? "text-emerald-900"
                          : "text-rose-900"
                      }`}
                    >
                      {item.type === "Entrada" ? "+ " : "− "}
                      {money(item.amount)}
                    </td>

                    {isOwner && (
                      <td className="px-5 py-4">
                        {item.orderId ? (
                          <span className="text-secondary-text text-xs">
                            Gerada pelo pedido
                          </span>
                        ) : (
                          <div className="flex gap-2">
                            <EditButton
                              objectToEdit={{ id: item.id }}
                              onEdit={() => onEdit(item)}
                            />
                            <DeleteButton
                              objectToDelete={{ id: item.id }}
                              onDelete={() => onDelete(item.id)}
                            />
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="px-5 py-14 text-center">
                <div className="text-secondary-text mx-auto mb-3 grid size-12 place-items-center rounded-full bg-slate-100 text-xl">
                  R$
                </div>
                <p className="font-semibold">Nenhuma movimentação encontrada</p>
                <p className="text-secondary-text mt-1 text-xs">
                  Tente alterar os filtros ou cadastre uma nova movimentação.
                </p>
                <button
                  type="button"
                  onClick={onNew}
                  className="text-accent-color mt-4 text-sm font-semibold"
                >
                  Adicionar movimentação
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
