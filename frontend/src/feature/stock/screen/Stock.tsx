import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import NavBar from "../../navbar/NavBar.tsx";
import {
  productService,
  validateProductPayload,
  type Product,
  type ProductFilters,
  type ProductPayload,
  type ProductSort,
  type ProductSortField,
} from "../../../service/productService.ts";
import DeleteProductModal from "../components/DeleteProductModal.tsx";
import ProductForm from "../components/ProductForm.tsx";
import StockTable from "../components/StockTable.tsx";
import StockToolbar from "../components/StockToolbar.tsx";

const emptyFilters: ProductFilters = {
  name: "",
  code: "",
  status: "",
  minPrice: "",
  maxPrice: "",
  minQuantity: "",
  maxQuantity: "",
};

const productRepository = {
  toQuery(filters: ProductFilters) {
    const params = new URLSearchParams();
    if (filters.name) params.set("name", filters.name);
    if (filters.code) params.set("code", filters.code);
    if (filters.status)
      params.set("active", filters.status === "Ativo" ? "true" : "false");
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.minQuantity) params.set("minQuantity", filters.minQuantity);
    if (filters.maxQuantity) params.set("maxQuantity", filters.maxQuantity);
    return params;
  },
};

const validateFilters = (filters: ProductFilters): string | null => {
  const minPrice = filters.minPrice !== "" ? Number(filters.minPrice) : null;
  const maxPrice = filters.maxPrice !== "" ? Number(filters.maxPrice) : null;
  const minQuantity =
    filters.minQuantity !== "" ? Number(filters.minQuantity) : null;
  const maxQuantity =
    filters.maxQuantity !== "" ? Number(filters.maxQuantity) : null;

  if (
    (minPrice !== null && minPrice < 0) ||
    (maxPrice !== null && maxPrice < 0)
  ) {
    return "O preço nos filtros não pode ser negativo.";
  }

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    return "O preço mínimo não pode ser maior que o preço máximo.";
  }

  if (
    (minQuantity !== null && minQuantity < 0) ||
    (maxQuantity !== null && maxQuantity < 0)
  ) {
    return "A quantidade nos filtros não pode ser negativa.";
  }

  if (
    minQuantity !== null &&
    maxQuantity !== null &&
    minQuantity > maxQuantity
  ) {
    return "A quantidade mínima não pode ser maior que a quantidade máxima.";
  }

  return null;
};

const compareProducts = (a: Product, b: Product, sort: ProductSort): number => {
  const direction = sort.ascending ? 1 : -1;

  if (sort.field === "quantity") {
    const diff = a.quantity - b.quantity;
    if (diff !== 0) return diff * direction;
  } else if (sort.field === "price") {
    const diff = a.price - b.price;
    if (diff !== 0) return diff * direction;
  }

  return a.name.localeCompare(b.name, "pt-BR") * direction;
};

const buttonClass =
  "flex h-[52px] items-center justify-center rounded-[10px] px-6 text-[15px] font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

export default function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [view, setView] = useState<"list" | "add" | "edit" | "delete">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<ProductSort>({
    field: "name",
    ascending: true,
  });
  const [filters, setFilters] = useState<ProductFilters>(emptyFilters);
  const [draftFilters, setDraftFilters] =
    useState<ProductFilters>(emptyFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const retryFetch = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    productService
      .getProducts(filters, sort)
      .then((data) => {
        setProducts(data);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os produtos.";
        setLoadError(message);
        toast.error("Erro ao consultar produtos no banco de dados.");
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [filters, sort]);

  useEffect(() => {
    let active = true;
    productService
      .getProducts(filters, sort)
      .then((data) => {
        if (!active) return;
        setProducts(data);
        setLoadError(null);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os produtos.";
        setLoadError(message);
        setIsLoading(false);
        toast.error("Erro ao consultar produtos no banco de dados.");
        console.error(error);
      });

    return () => {
      active = false;
    };
  }, [filters, sort]);

  const selected = products.find((product) => product.id === selectedId);

  const filtered = useMemo(() => {
    const params = productRepository.toQuery(filters);
    const normalizedQuery = query.trim().toLowerCase();

    return products
      .filter(
        (p) =>
          (!normalizedQuery ||
            `${p.name} ${p.code} ${p.id}`
              .toLowerCase()
              .includes(normalizedQuery)) &&
          (!params.has("name") ||
            p.name.toLowerCase().includes(params.get("name")!.toLowerCase())) &&
          (!params.has("code") ||
            p.code.toLowerCase().includes(params.get("code")!.toLowerCase())) &&
          (!params.has("active") ||
            String(p.active) === params.get("active")) &&
          (!params.has("minPrice") ||
            p.price >= Number(params.get("minPrice"))) &&
          (!params.has("maxPrice") ||
            p.price <= Number(params.get("maxPrice"))) &&
          (!params.has("minQuantity") ||
            p.quantity >= Number(params.get("minQuantity"))) &&
          (!params.has("maxQuantity") ||
            p.quantity <= Number(params.get("maxQuantity"))),
      )
      .sort((a, b) => compareProducts(a, b, sort));
  }, [products, query, filters, sort]);

  const back = () => {
    if (isSubmitting) return;
    setView("list");
    setSelectedId(null);
  };

  const applyFilters = () => {
    const filterError = validateFilters(draftFilters);
    if (filterError) {
      toast.error(filterError);
      return;
    }
    setIsLoading(true);
    setFilters(draftFilters);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setIsLoading(true);
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  const handleSortChange = (nextSort: ProductSort) => {
    setIsLoading(true);
    setSort(nextSort);
  };

  const toggleSortDirection = () => {
    setIsLoading(true);
    setSort((prev) => ({ ...prev, ascending: !prev.ascending }));
  };

  const handleSortByColumn = (field: ProductSortField) => {
    setIsLoading(true);
    setSort((prev) =>
      prev.field === field
        ? { field, ascending: !prev.ascending }
        : { field, ascending: true },
    );
  };

  const save = async (data: ProductPayload) => {
    const mode = view === "edit" ? "edit" : "add";
    const validationError = validateProductPayload(data, mode);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const duplicateInState = products.some(
      (p) =>
        p.code.trim().toLowerCase() === data.code.trim().toLowerCase() &&
        (mode !== "edit" || p.id !== selectedId),
    );
    if (duplicateInState) {
      toast.error("Já existe um produto cadastrado com este código.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (view === "edit" && selectedId !== null) {
        const updated = await productService.updateProduct(selectedId, data);
        setProducts((all) =>
          all.map((p) => (p.id === selectedId ? updated : p)),
        );
        toast.success("Produto atualizado com sucesso!");
      } else {
        const created = await productService.createProduct(data);
        setProducts((all) => [...all, created]);
        toast.success("Produto cadastrado com sucesso!");
      }
      setView("list");
      setSelectedId(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o produto.";
      toast.error(message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (selectedId === null) return;

    setIsSubmitting(true);
    try {
      await productService.deleteProduct(selectedId);
      setProducts((all) => all.filter((p) => p.id !== selectedId));
      toast.success("Produto excluído com sucesso!");
      setView("list");
      setSelectedId(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o produto.";
      toast.error(message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-[#1f2937]">
      <NavBar option="STOCK" />
      <main className="min-w-0 flex-1 px-[43px] py-12 max-lg:px-6">
        <div key={view} className="stock-dissolve mx-auto max-w-[1440px]">
          {view === "list" ? (
            <>
              <header className="mb-[22px] flex items-center justify-between gap-5">
                <h1 className="rounded-[15px] bg-white/20 p-[10px] text-[40px] leading-none font-bold text-black shadow-[0_0_4px_#00000040]">
                  Estoque
                </h1>
                <button
                  onClick={() => setView("add")}
                  className={`${buttonClass} bg-accent-color gap-2 text-white`}
                >
                  <span className="text-xl">＋</span>Cadastrar Produto
                </button>
              </header>

              <StockToolbar
                query={query}
                onQueryChange={setQuery}
                filterOpen={filterOpen}
                onToggleFilter={() => {
                  setDraftFilters(filters);
                  setFilterOpen((open) => !open);
                }}
                onCloseFilter={() => setFilterOpen(false)}
                draftFilters={draftFilters}
                onDraftFiltersChange={setDraftFilters}
                onApplyFilters={applyFilters}
                onClearFilters={clearFilters}
                sort={sort}
                onSortChange={handleSortChange}
                onToggleSortDirection={toggleSortDirection}
              />

              <StockTable
                products={filtered}
                isLoading={isLoading}
                loadError={loadError}
                sort={sort}
                onSortByColumn={handleSortByColumn}
                onRetry={retryFetch}
                onEdit={(productId) => {
                  setSelectedId(productId);
                  setView("edit");
                }}
                onDelete={(productId) => {
                  setSelectedId(productId);
                  setView("delete");
                }}
              />
            </>
          ) : view === "delete" ? (
            <DeleteProductModal
              product={selected}
              isSubmitting={isSubmitting}
              onCancel={back}
              onConfirm={confirmDelete}
            />
          ) : (
            <ProductForm
              mode={view}
              initial={view === "edit" ? selected : undefined}
              cancel={back}
              save={save}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </main>
    </div>
  );
}
