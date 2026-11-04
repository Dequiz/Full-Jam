import type { Product } from "../../../service/productService.ts";
import DeleteButton from "../../../core/DeleteButton.tsx";
import EditButton from "../../../core/EditButton.tsx";

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
          <EditButton
            objectToEdit={{
              id: product.id
          }}
            onEdit={() => onEdit(product.id)}
          />
          <DeleteButton
            objectToDelete={{
              id: product.id,
            }}
            onDelete={() => onDelete(product.id)}
          />
        </div>
      </td>
    </tr>
  );
};

export default StockTableRow;
