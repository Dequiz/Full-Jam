import type { Product } from "../../../service/productService.ts";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type StockTableRowProps = {
  product: Product;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
};

const StockTableRow = ({ product, onEdit, onDelete }: StockTableRowProps) => {
  return (
    <tr className="border-t border-[#e7ebf3]">
      <td className="px-5 py-4">{product.id}</td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {product.image ? (
            <img
              src={product.image}
              alt=""
              className="h-10 w-[60px] rounded-[6px] object-cover"
            />
          ) : (
            <div className="h-10 w-[60px] rounded-[6px] bg-slate-100" />
          )}
          <span>{product.name}</span>
        </div>
      </td>
      <td className="px-5 py-4">{product.quantity}</td>
      <td className="px-5 py-4">{formatCurrency(product.price)}</td>
      <td className="px-5 py-4">{product.code}</td>
      <td className="px-5 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            product.active
              ? "bg-active-status-bg text-active-status-text"
              : "bg-pending-status-bg text-pending-status-text"
          }`}
        >
          {product.active ? "Ativo" : "Inativo"}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(product.id)}
            aria-label="Editar produto"
            className="group text-accent-color grid size-8 cursor-pointer place-items-center rounded-lg bg-[#f3f4f6] transition duration-200 hover:-translate-y-1 hover:bg-[#e3eaff] hover:shadow-md focus-visible:-translate-y-1"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4 fill-none stroke-current stroke-[1.2] transition group-hover:fill-current"
            >
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a1 1 0 0 0 0-1.41l-2.51-2.51a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 2-1.66Z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(product.id)}
            aria-label="Excluir produto"
            className="group text-destructive-color grid size-8 cursor-pointer place-items-center rounded-lg bg-[#f3f4f6] transition duration-200 hover:-translate-y-1 hover:bg-[#fff1f1] hover:shadow-md focus-visible:-translate-y-1"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4 fill-none stroke-current stroke-[1.2] transition group-hover:fill-current"
            >
              <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 12H7L6 9Zm3 2v8h2v-8H9Zm4 0v8h2v-8h-2Z" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default StockTableRow;
