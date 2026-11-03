import { PulseLoader } from "react-spinners";
import type { Product } from "../../../service/productService.ts";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const buttonClass =
  "flex h-[52px] items-center justify-center rounded-[10px] px-6 text-[15px] font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

type DeleteProductModalProps = {
  product?: Product;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

const DeleteProductModal = ({
  product,
  isSubmitting,
  onCancel,
  onConfirm,
}: DeleteProductModalProps) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <div className="border-input-stroke pointer-events-auto absolute top-1/2 left-[calc(50%+150px)] w-[592px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[15px] border bg-white shadow-[0_16px_48px_rgba(20,32,61,0.15)]">
        <div className="flex flex-col gap-6 p-8">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-secondary-text cursor-pointer self-end text-xl"
          >
            ×
          </button>
          <div>
            <h2 className="mb-2 text-[26px] font-bold">Excluir produto?</h2>
            <p className="text-secondary-text text-[15px] leading-6">
              Você está prestes a excluir o produto abaixo do estoque. Confira a
              identificação antes de continuar.
            </p>
          </div>
          <div className="flex items-center gap-5 rounded-[10px] border border-[#e7ebf3] bg-slate-50 p-5">
            {product?.image && (
              <img
                src={product.image}
                className="h-[70px] w-28 rounded-md object-cover"
                alt=""
              />
            )}
            <div className="flex-1">
              <div className="flex justify-between">
                <strong>{product?.name}</strong>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    product?.active
                      ? "bg-active-status-bg text-active-status-text"
                      : "bg-pending-status-bg text-pending-status-text"
                  }`}
                >
                  {product?.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <p className="text-secondary-text text-[13px]">
                Código {product?.code} • ID {product?.id}
              </p>
              <p className="text-[13px]">
                {product && formatCurrency(product.price)} •{" "}
                {product?.quantity} unidades em estoque
              </p>
            </div>
          </div>
          <p className="text-destructive-color rounded-[10px] bg-[#fff1f1] p-4 text-[13px] leading-5">
            ⚠ Esta ação não pode ser desfeita. Apenas o registro selecionado
            será removido da tabela.
          </p>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#e7ebf3] px-8 py-6">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className={`${buttonClass} border-input-stroke text-accent-color border bg-white`}
          >
            Cancelar
          </button>
          <button
            onClick={() => void onConfirm()}
            disabled={isSubmitting}
            className={`${buttonClass} bg-destructive-color text-white`}
          >
            {isSubmitting ? (
              <PulseLoader color="#ffffff" size={8} margin={2} />
            ) : (
              "Excluir produto"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;
