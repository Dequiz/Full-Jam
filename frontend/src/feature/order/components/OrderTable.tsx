import { PulseLoader } from "react-spinners";
import type {
  Order,
  OrderSort,
  OrderSortField,
} from "../../../service/orderService.ts";
import OrderTableRow from "./OrderTableRow.tsx";

const TABLE_HEADERS: {
  label: string;
  sortField?: OrderSortField;
  align?: "left" | "center";
}[] = [
  { label: "ID", align: "left" },
  { label: "Cliente", sortField: "customer", align: "center" },
  { label: "Data", sortField: "date", align: "center" },
  { label: "Itens / Qtde", align: "center" },
  { label: "Valor", sortField: "value", align: "center" },
  { label: "Status", align: "center" },
  { label: "Ação", align: "center" },
];

type OrderTableProps = {
  orders: Order[];
  totalOrdersCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  loadError: string | null;
  sort: OrderSort;
  onSortByColumn: (field: OrderSortField) => void;
  onRetry: () => void;
  onEdit: (orderId: string) => void;
};

const OrderTable = ({
  orders,
  totalOrdersCount,
  currentPage,
  pageSize,
  onPageChange,
  isLoading,
  loadError,
  sort,
  onSortByColumn,
  onRetry,
  onEdit,
}: OrderTableProps) => {
  const totalPages = Math.max(1, Math.ceil(totalOrdersCount / pageSize));
  const startItem =
    totalOrdersCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalOrdersCount);

  return (
    <section>
      <h2 className="mb-4 text-[22px] font-bold text-[#1f2937]">
        Histórico de pedidos
      </h2>

      <div className="overflow-x-auto rounded-t-[15px] border-b border-[#395CEB] bg-white">
        <table className="w-full min-w-[850px] border-collapse text-[16px]">
          <thead className="bg-accent-color text-[15px] font-semibold text-white">
            <tr>
              {TABLE_HEADERS.map(({ label, sortField, align }) => {
                const isActiveSort = sortField && sort.field === sortField;

                return (
                  <th
                    key={label}
                    className={`px-6 py-5 ${
                      align === "center" ? "text-center" : "text-left"
                    }`}
                  >
                    {sortField ? (
                      <button
                        type="button"
                        onClick={() => onSortByColumn(sortField)}
                        className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-white hover:opacity-90"
                      >
                        <span>{label}</span>
                        <span className="text-xs opacity-90">
                          {isActiveSort ? (sort.ascending ? "↑" : "↓") : "↕"}
                        </span>
                      </button>
                    ) : (
                      label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {!isLoading &&
              orders.map((order) => (
                <OrderTableRow key={order.id} order={order} onEdit={onEdit} />
              ))}
          </tbody>
        </table>

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 p-10">
            <PulseLoader color="#395CEB" size={10} />
            <p className="text-secondary-text text-[13px]">
              Carregando pedidos...
            </p>
          </div>
        )}

        {!isLoading && loadError && (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-destructive-color text-[13px]">
              Não foi possível carregar os pedidos ({loadError}).
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="text-accent-color cursor-pointer text-[13px] font-semibold underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!isLoading && !loadError && orders.length === 0 && (
          <p className="text-secondary-text p-8 text-center text-[13px]">
            Nenhum pedido encontrado.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-secondary-text text-[13px]">
          {totalOrdersCount > 0
            ? `${startItem}–${endItem} de ${totalOrdersCount} pedidos`
            : "0 de 0 pedidos"}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => onPageChange(currentPage - 1)}
            className="border-accent-color text-accent-color h-[38px] cursor-pointer rounded-[8px] border bg-white px-4 text-[13px] font-semibold transition hover:bg-[#f5f7ff] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => onPageChange(currentPage + 1)}
            className="bg-accent-color h-[38px] cursor-pointer rounded-[8px] px-4 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>
    </section>
  );
};

export default OrderTable;
