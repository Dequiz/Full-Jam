import { PulseLoader } from "react-spinners";
import type { Product } from "../../../service/productService.ts";
import StockTableRow from "./StockTableRow.tsx";

const TABLE_HEADERS = [
  "ID",
  "Nome do Produto",
  "Quantidade",
  "Preço",
  "Código",
  "Status",
  "Ações",
];

type StockTableProps = {
  products: Product[];
  isLoading: boolean;
  loadError: string | null;
  onRetry: () => void;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
};

const StockTable = ({
  products,
  isLoading,
  loadError,
  onRetry,
  onEdit,
  onDelete,
}: StockTableProps) => {
  return (
    <div className="border-input-stroke overflow-x-auto rounded-[15px] border bg-white">
      <table className="w-full min-w-[850px] border-collapse text-left text-[16px]">
        <thead className="bg-accent-color text-[15px] font-semibold text-white">
          <tr>
            {TABLE_HEADERS.map((header) => (
              <th key={header} className="px-5 py-5">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!isLoading &&
            products.map((product) => (
              <StockTableRow
                key={product.id}
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
        </tbody>
      </table>

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 p-10">
          <PulseLoader color="#395CEB" size={10} />
          <p className="text-secondary-text text-[13px]">
            Carregando produtos...
          </p>
        </div>
      )}

      {!isLoading && loadError && (
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-destructive-color text-[13px]">
            Não foi possível carregar os produtos ({loadError}).
          </p>
          <button
            onClick={onRetry}
            className="text-accent-color cursor-pointer text-[13px] font-semibold underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!isLoading && !loadError && products.length === 0 && (
        <p className="text-secondary-text p-8 text-center text-[13px]">
          Nenhum produto encontrado.
        </p>
      )}
    </div>
  );
};

export default StockTable;
