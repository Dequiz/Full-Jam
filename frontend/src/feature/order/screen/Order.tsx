import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import NavBar from "../../navbar/NavBar.tsx";
import {
  orderService,
  validateOrderPayload,
  type Customer,
  type Order as OrderModel,
  type OrderFilters,
  type OrderSort,
  type OrderSortField,
  type SaveOrderPayload,
} from "../../../service/orderService.ts";
import type { Product } from "../../../service/productService.ts";
import OrderForm from "../components/OrderForm.tsx";
import OrderSummaryCards from "../components/OrderSummaryCards.tsx";
import OrderTable from "../components/OrderTable.tsx";
import OrderToolbar from "../components/OrderToolbar.tsx";

const PAGE_SIZE = 7;

const emptyFilters: OrderFilters = {
  customerName: "",
  status: "",
  minDate: "",
  maxDate: "",
  minValue: "",
  maxValue: "",
};

const validateOrderFilters = (filters: OrderFilters): string | null => {
  const minVal = filters.minValue !== "" ? Number(filters.minValue) : null;
  const maxVal = filters.maxValue !== "" ? Number(filters.maxValue) : null;

  if ((minVal !== null && minVal < 0) || (maxVal !== null && maxVal < 0)) {
    return "O valor nos filtros não pode ser negativo.";
  }

  if (minVal !== null && maxVal !== null && minVal > maxVal) {
    return "O valor mínimo não pode ser maior que o valor máximo.";
  }

  if (filters.minDate && filters.maxDate && filters.minDate > filters.maxDate) {
    return "A data inicial não pode ser posterior à data final.";
  }

  return null;
};

const compareOrders = (
  a: OrderModel,
  b: OrderModel,
  sort: OrderSort,
): number => {
  const direction = sort.ascending ? 1 : -1;

  if (sort.field === "value") {
    const diff = a.totalValue - b.totalValue;
    if (diff !== 0) return diff * direction;
  } else if (sort.field === "customer") {
    const cmp = a.customerName.localeCompare(b.customerName, "pt-BR");
    if (cmp !== 0) return cmp * direction;
  }

  return a.orderDate.localeCompare(b.orderDate) * direction;
};

const buttonClass =
  "flex h-[52px] items-center justify-center rounded-[10px] px-6 text-[15px] font-semibold cursor-pointer transition disabled:cursor-not-allowed disabled:opacity-60";

const Order = () => {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<OrderFilters>(emptyFilters);
  const [sort, setSort] = useState<OrderSort>({
    field: "date",
    ascending: false,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const retryFetch = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    Promise.all([
      orderService.getOrders(),
      orderService.getCustomers(),
      orderService.getAvailableProducts(),
    ])
      .then(([ordersData, customersData, productsData]) => {
        setOrders(ordersData);
        setCustomers(customersData);
        setProducts(productsData);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os pedidos.";
        setLoadError(message);
        toast.error("Erro ao consultar pedidos no banco de dados.");
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      orderService.getOrders(),
      orderService.getCustomers(),
      orderService.getAvailableProducts(),
    ])
      .then(([ordersData, customersData, productsData]) => {
        if (!active) return;
        setOrders(ordersData);
        setCustomers(customersData);
        setProducts(productsData);
        setLoadError(null);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os pedidos.";
        setLoadError(message);
        setIsLoading(false);
        toast.error("Erro ao consultar pedidos no banco de dados.");
        console.error(error);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedId),
    [orders, selectedId],
  );

  const counts = useMemo(() => {
    const totalCount = orders.length;
    const pendingCount = orders.filter((o) => o.status === "Pendente").length;
    const inProgressCount = orders.filter(
      (o) => o.status === "Em andamento",
    ).length;
    const deliveredCount = orders.filter((o) => o.status === "Entregue").length;

    return { totalCount, pendingCount, inProgressCount, deliveredCount };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders
      .filter((order) => {
        const itemsText = order.items
          .map((i) => `${i.productName} ${i.productCode}`)
          .join(" ");
        const searchable =
          `${order.displayCode} ${order.id} ${order.customerName} ${itemsText}`.toLowerCase();

        if (normalizedQuery && !searchable.includes(normalizedQuery)) {
          return false;
        }

        if (
          filters.customerName.trim() &&
          !order.customerName
            .toLowerCase()
            .includes(filters.customerName.trim().toLowerCase())
        ) {
          return false;
        }

        if (filters.status && order.status !== filters.status) {
          return false;
        }

        if (filters.minDate && order.orderDate < filters.minDate) {
          return false;
        }

        if (filters.maxDate && order.orderDate > filters.maxDate) {
          return false;
        }

        if (
          filters.minValue !== "" &&
          order.totalValue < Number(filters.minValue)
        ) {
          return false;
        }

        if (
          filters.maxValue !== "" &&
          order.totalValue > Number(filters.maxValue)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => compareOrders(a, b, sort));
  }, [orders, query, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedOrders = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredOrders, safeCurrentPage]);

  const backToList = () => {
    if (isSubmitting) return;
    setView("list");
    setSelectedId(null);
  };

  const handleApplyFilters = () => {
    const error = validateOrderFilters(draftFilters);
    if (error) {
      toast.error(error);
      return;
    }
    setFilters(draftFilters);
    setCurrentPage(1);
    setFilterOpen(false);
  };

  const handleClearFilters = () => {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
    setCurrentPage(1);
  };

  const handleSelectStatusCard = (status: string) => {
    const updated = { ...filters, status };
    setFilters(updated);
    setDraftFilters(updated);
    setCurrentPage(1);
  };

  const handleSortByColumn = (field: OrderSortField) => {
    setSort((prev) =>
      prev.field === field
        ? { field, ascending: !prev.ascending }
        : { field, ascending: true },
    );
  };

  const handleSaveOrder = async (payload: SaveOrderPayload) => {
    const validationError = validateOrderPayload(payload);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      if (view === "edit" && selectedId) {
        await orderService.updateOrder(selectedId, payload);
        toast.success("Pedido atualizado com sucesso!");
      } else {
        await orderService.createOrder(payload);
        toast.success("Pedido cadastrado com sucesso!");
      }

      const [updatedOrders, updatedCustomers] = await Promise.all([
        orderService.getOrders(),
        orderService.getCustomers(),
      ]);
      setOrders(updatedOrders);
      setCustomers(updatedCustomers);
      setView("list");
      setSelectedId(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o pedido.";
      toast.error(message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-[#1f2937]">
      <NavBar option="ORDER" />
      <main className="min-w-0 flex-1 px-[43px] py-12 max-lg:px-6">
        <div key={view} className="stock-dissolve mx-auto max-w-[1440px]">
          {view === "list" ? (
            <>
              <header className="mb-[26px] flex flex-wrap items-center justify-between gap-5">
                <h1 className="rounded-[15px] bg-white/20 p-[10px] text-[40px] leading-none font-bold text-black shadow-[0_0_4px_#00000040]">
                  Pedidos
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(null);
                    setView("add");
                  }}
                  className={`${buttonClass} bg-accent-color gap-2 text-white hover:opacity-95`}
                >
                  <span className="text-xl">＋</span>Adicionar pedido
                </button>
              </header>

              <OrderSummaryCards
                totalCount={counts.totalCount}
                pendingCount={counts.pendingCount}
                inProgressCount={counts.inProgressCount}
                deliveredCount={counts.deliveredCount}
                activeStatusFilter={filters.status}
                onSelectStatus={handleSelectStatusCard}
              />

              <OrderToolbar
                query={query}
                onQueryChange={(val) => {
                  setQuery(val);
                  setCurrentPage(1);
                }}
                filterOpen={filterOpen}
                onToggleFilter={() => {
                  setDraftFilters(filters);
                  setFilterOpen((open) => !open);
                }}
                onCloseFilter={() => setFilterOpen(false)}
                draftFilters={draftFilters}
                onDraftFiltersChange={setDraftFilters}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
                sort={sort}
                onToggleSortDirection={() =>
                  setSort((prev) => ({ ...prev, ascending: !prev.ascending }))
                }
              />

              <OrderTable
                orders={paginatedOrders}
                totalOrdersCount={filteredOrders.length}
                currentPage={safeCurrentPage}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
                isLoading={isLoading}
                loadError={loadError}
                sort={sort}
                onSortByColumn={handleSortByColumn}
                onRetry={retryFetch}
                onEdit={(orderId) => {
                  setSelectedId(orderId);
                  setView("edit");
                }}
              />
            </>
          ) : (
            <OrderForm
              mode={view}
              initial={view === "edit" ? selectedOrder : undefined}
              customers={customers}
              products={products}
              isSubmitting={isSubmitting}
              onCancel={backToList}
              onSave={handleSaveOrder}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Order;
