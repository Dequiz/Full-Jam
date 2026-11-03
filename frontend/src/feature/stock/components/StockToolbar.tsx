import type { ProductFilters } from "../../../service/productService.ts";

const FILTER_FIELDS = [
  ["name", "Nome"],
  ["code", "Código"],
  ["minPrice", "Preço mínimo"],
  ["maxPrice", "Preço máximo"],
  ["minQuantity", "Qtd. mínima"],
  ["maxQuantity", "Qtd. máxima"],
] as const;

type StockToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  filterOpen: boolean;
  onToggleFilter: () => void;
  onCloseFilter: () => void;
  draftFilters: ProductFilters;
  onDraftFiltersChange: (filters: ProductFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  sortAscending: boolean;
  onToggleSort: () => void;
};

const StockToolbar = ({
  query,
  onQueryChange,
  filterOpen,
  onToggleFilter,
  onCloseFilter,
  draftFilters,
  onDraftFiltersChange,
  onApplyFilters,
  onClearFilters,
  sortAscending,
  onToggleSort,
}: StockToolbarProps) => {
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
          onClick={onToggleFilter}
          className="border-input-stroke text-accent-color flex h-[52px] cursor-pointer items-center gap-2 rounded-[10px] border bg-white px-4 text-[15px] font-semibold"
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
          aria-label={
            sortAscending ? "Ordenar de A a Z" : "Ordenar de Z a A"
          }
          onClick={onToggleSort}
          className="bg-accent-color grid size-[30px] cursor-pointer place-items-center rounded-full text-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-5 fill-none stroke-current stroke-[1.8]"
            aria-hidden="true"
          >
            <path
              className={`origin-center transition-transform duration-300 ${
                sortAscending ? "rotate-180" : "rotate-0"
              }`}
              d="M7 4v14m0 0-4-4m4 4 4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className={`origin-center transition-transform duration-300 ${
                sortAscending ? "rotate-180" : "rotate-0"
              }`}
              d="M17 20V6m0 0-4 4m4-4 4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {filterOpen && (
          <div className="stock-filter-enter border-input-stroke absolute top-[60px] right-0 z-20 w-[320px] rounded-[10px] border bg-white p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <strong>Filtrar produtos</strong>
              <button onClick={onCloseFilter} className="cursor-pointer">
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {FILTER_FIELDS.map(([key, label]) => (
                <label key={key} className="text-secondary-text text-xs">
                  {label}
                  <input
                    value={draftFilters[key]}
                    min={
                      key.includes("Price") || key.includes("Quantity")
                        ? "0"
                        : undefined
                    }
                    step={key.includes("Price") ? "0.01" : undefined}
                    onChange={(e) =>
                      onDraftFiltersChange({
                        ...draftFilters,
                        [key]: e.target.value,
                      })
                    }
                    type={
                      key.includes("Price") || key.includes("Quantity")
                        ? "number"
                        : "text"
                    }
                    className="border-input-stroke mt-1 h-10 w-full rounded-lg border px-2 text-sm text-[#1f2937]"
                  />
                </label>
              ))}
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
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={onClearFilters}
                className="text-secondary-text cursor-pointer text-sm"
              >
                Limpar
              </button>
              <button
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

export default StockToolbar;
