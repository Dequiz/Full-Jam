import type {
  OrderFilters,
  OrderSort,
} from "../../../service/orderService.ts";

type OrderToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  filterOpen: boolean;
  onToggleFilter: () => void;
  onCloseFilter: () => void;
  draftFilters: OrderFilters;
  onDraftFiltersChange: (filters: OrderFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  sort: OrderSort;
  onToggleSortDirection: () => void;
};

const OrderToolbar = ({
  query,
  onQueryChange,
  filterOpen,
  onToggleFilter,
  onCloseFilter,
  draftFilters,
  onDraftFiltersChange,
  onApplyFilters,
  onClearFilters,
  sort,
  onToggleSortDirection,
}: OrderToolbarProps) => {
  return (
    <div className="relative mb-[22px] flex flex-wrap items-center justify-between gap-4">
      <label className="border-input-stroke flex h-[52px] w-full max-w-[510px] items-center gap-3 rounded-[10px] border bg-white px-4">
        <span className="text-secondary-text text-xl">⌕</span>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Procure um produto"
          className="placeholder:text-secondary-text w-full bg-transparent text-[15px] outline-none"
        />
      </label>

      <div className="relative flex items-center gap-[15px]">
        <button
          type="button"
          onClick={onToggleFilter}
          className="border-input-stroke text-accent-color flex h-[52px] cursor-pointer items-center gap-2 rounded-[10px] border bg-white px-4 text-[15px] font-semibold transition hover:bg-slate-50"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={`size-5 transition-colors duration-200 ${
              filterOpen
                ? "fill-accent-color stroke-accent-color"
                : "stroke-accent-color fill-none"
            }`}
            strokeWidth="1.8"
          >
            <path
              d="M4 5h16l-6.3 7.3v5.2l-3.4 1.8v-7L4 5Z"
              strokeLinejoin="round"
            />
          </svg>
          Filtrar
        </button>

        <button
          type="button"
          aria-label={
            sort.ascending
              ? "Inverter para ordem decrescente"
              : "Inverter para ordem crescente"
          }
          title={
            sort.ascending
              ? "Ordem crescente (clique para inverter)"
              : "Ordem decrescente (clique para inverter)"
          }
          onClick={onToggleSortDirection}
          className="bg-accent-color grid size-[32px] cursor-pointer place-items-center rounded-full text-white transition hover:opacity-90"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-5 fill-none stroke-current stroke-[1.8]"
            aria-hidden="true"
          >
            <path
              className={`origin-center transition-transform duration-300 ${
                sort.ascending ? "rotate-180" : "rotate-0"
              }`}
              d="M7 4v14m0 0-4-4m4 4 4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className={`origin-center transition-transform duration-300 ${
                sort.ascending ? "rotate-180" : "rotate-0"
              }`}
              d="M17 20V6m0 0-4 4m4-4 4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {filterOpen && (
          <div className="stock-filter-enter border-input-stroke absolute top-[60px] right-0 z-20 w-[330px] rounded-[10px] border bg-white p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <strong>Filtrar pedidos</strong>
              <button
                type="button"
                onClick={onCloseFilter}
                className="cursor-pointer text-lg"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-secondary-text col-span-2 text-xs">
                Cliente
                <input
                  type="text"
                  value={draftFilters.customerName}
                  onChange={(e) =>
                    onDraftFiltersChange({
                      ...draftFilters,
                      customerName: e.target.value,
                    })
                  }
                  placeholder="Nome do cliente"
                  className="border-input-stroke mt-1 h-10 w-full rounded-lg border px-2 text-sm text-[#1f2937]"
                />
              </label>

              <label className="text-secondary-text text-xs">
                Data inicial
                <input
                  type="date"
                  value={draftFilters.minDate}
                  onChange={(e) =>
                    onDraftFiltersChange({
                      ...draftFilters,
                      minDate: e.target.value,
                    })
                  }
                  className="border-input-stroke mt-1 h-10 w-full rounded-lg border px-2 text-sm text-[#1f2937]"
                />
              </label>

              <label className="text-secondary-text text-xs">
                Data final
                <input
                  type="date"
                  value={draftFilters.maxDate}
                  onChange={(e) =>
                    onDraftFiltersChange({
                      ...draftFilters,
                      maxDate: e.target.value,
                    })
                  }
                  className="border-input-stroke mt-1 h-10 w-full rounded-lg border px-2 text-sm text-[#1f2937]"
                />
              </label>

              <label className="text-secondary-text text-xs">
                Valor mínimo
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draftFilters.minValue}
                  onChange={(e) =>
                    onDraftFiltersChange({
                      ...draftFilters,
                      minValue: e.target.value,
                    })
                  }
                  className="border-input-stroke mt-1 h-10 w-full rounded-lg border px-2 text-sm text-[#1f2937]"
                />
              </label>

              <label className="text-secondary-text text-xs">
                Valor máximo
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draftFilters.maxValue}
                  onChange={(e) =>
                    onDraftFiltersChange({
                      ...draftFilters,
                      maxValue: e.target.value,
                    })
                  }
                  className="border-input-stroke mt-1 h-10 w-full rounded-lg border px-2 text-sm text-[#1f2937]"
                />
              </label>

              <label className="text-secondary-text col-span-2 text-xs">
                Status
                <select
                  value={draftFilters.status}
                  onChange={(e) =>
                    onDraftFiltersChange({
                      ...draftFilters,
                      status: e.target.value,
                    })
                  }
                  className="border-input-stroke mt-1 h-10 w-full rounded-lg border px-2 text-sm text-[#1f2937]"
                >
                  <option value="">Todos</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Entregue">Entregue</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={onClearFilters}
                className="text-secondary-text cursor-pointer text-sm"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={onApplyFilters}
                className="bg-accent-color cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderToolbar;
