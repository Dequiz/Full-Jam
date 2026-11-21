import { useState, type FormEvent } from "react";
import { PulseLoader } from "react-spinners";
import { toast } from "sonner";
import type {
  Product,
  ProductPayload,
} from "../../../service/productService.ts";

const buttonClass =
  "flex h-[52px] items-center justify-center rounded-[10px] px-6 text-[15px] font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";
const inputClass =
  "h-[56px] w-full rounded-[10px] border border-input-stroke bg-white px-4 text-[17px] text-[#1f2937] outline-none placeholder:text-secondary-text focus:border-accent-color";

type ProductFormProps = {
  mode: "add" | "edit";
  initial?: Product;
  cancel: () => void;
  save: (product: ProductPayload) => Promise<void>;
  isSubmitting: boolean;
};

const ProductForm = ({
  mode,
  initial,
  cancel,
  save,
  isSubmitting,
}: ProductFormProps) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [quantity, setQuantity] = useState(
    initial ? String(initial.quantity) : "",
  );

  const handleQuantityDelta = (delta: number) => {
    const current = parseInt(quantity, 10);
    const valid = Number.isNaN(current) ? 0 : current;
    const next = Math.max(0, valid + delta);
    setQuantity(String(next));
    if (next === 0) {
      setActive("Inativo");
    }
  };

  const handleQuantityChange = (valStr: string) => {
    const val = parseInt(valStr, 10);
    if (valStr === "") {
      setQuantity("");
      return;
    }
    const safe = Number.isNaN(val) ? 0 : Math.max(0, val);
    setQuantity(String(safe));
    if (safe === 0) {
      setActive("Inativo");
    }
  };
  const [code, setCode] = useState(initial?.code ?? "");
  const [active, setActive] = useState(
    initial?.active ? "Ativo" : initial ? "Inativo" : "",
  );
  const [image, setImage] = useState(initial?.image ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState("");
  const [imageError, setImageError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (imageError) {
      toast.error(imageError);
      return;
    }

    if (active !== "Ativo" && active !== "Inativo") {
      toast.error("Selecione o status do produto.");
      return;
    }

    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);

    await save({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      quantity: parsedQuantity,
      code: code.trim(),
      active: active === "Ativo",
      image: image || undefined,
      imageFile,
    });
  };

  return (
    <div className="max-w-[1030px]">
      <div className="mb-5 flex items-center gap-3 text-[14px]">
        <button
          onClick={cancel}
          disabled={isSubmitting}
          className="text-accent-color cursor-pointer"
        >
          Estoque
        </button>
        <span>›</span>
        <span className="text-secondary-text">
          {mode === "edit" ? "Editar produto" : "Adicionar produto"}
        </span>
      </div>
      <h1 className="text-[30px] font-bold">
        {mode === "edit" ? "Editar produto" : "Adicionar produto"}
      </h1>
      <p className="text-secondary-text mt-2 mb-8 text-[13px]">
        {mode === "edit"
          ? "Atualize as informações e a imagem do produto selecionado."
          : "Preencha as informações e envie uma imagem para cadastrar um novo produto."}
      </p>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="border-input-stroke overflow-hidden rounded-[15px] border bg-white"
      >
        <div className="flex items-center justify-between bg-[#f5f7ff] px-5 py-4">
          <div>
            <h2 className="font-bold">{initial?.name ?? "Novo produto"}</h2>
            <p className="text-secondary-text text-[12px]">
              {initial
                ? `Código do produto: ${initial.code}`
                : "Informe os dados do produto antes de adicionar ao estoque."}
            </p>
          </div>
          {initial && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                initial.active
                  ? "bg-active-status-bg text-active-status-text"
                  : "bg-pending-status-bg text-pending-status-text"
              }`}
            >
              {initial.active ? "Ativo" : "Inativo"}
            </span>
          )}
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-[228px_1fr]">
          <div>
            <p className="mb-3 font-semibold">Imagem do produto</p>
            <div className="flex h-[175px] items-center justify-center overflow-hidden rounded-lg border border-[#e7ebf3] bg-slate-50">
              {image ? (
                <img
                  src={image}
                  alt="Prévia do produto"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="text-secondary-text text-center text-xs">
                  <span className="mx-auto grid size-10 place-items-center rounded-lg bg-[#f5f7ff]">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="fill-accent-color size-5"
                    >
                      <path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 3v12h12L12 11l-3 3-2-2-1 1V6Zm2.5 1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
                      <path d="m7 18 5-5 4 4 2-2 2 3H7Z" fill="white" />
                    </svg>
                  </span>
                  <p className="mt-3">Nenhuma imagem selecionada</p>
                  <p className="mt-2">A prévia será exibida aqui.</p>
                </div>
              )}
            </div>
            <label className="border-input-stroke text-accent-color mt-3 flex h-[38px] w-fit cursor-pointer items-center gap-2 rounded-[8px] border px-4 text-[12px] font-semibold">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="text-accent-color size-4 fill-current"
              >
                <path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 3v12h12L12 11l-3 3-2-2-1 1V6Zm2.5 1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
                <path d="m7 18 5-5 4 4 2-2 2 3H7Z" fill="white" />
              </svg>
              {image ? "Trocar imagem" : "Enviar imagem"}
              <input
                type="file"
                accept="image/png,image/jpeg"
                disabled={isSubmitting}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (
                    !["image/jpeg", "image/png"].includes(f.type) ||
                    f.size > 5 * 1024 * 1024
                  ) {
                    setImageError(
                      "Escolha um arquivo JPG ou PNG de até 5 MB.",
                    );
                    setImageFile(null);
                    return;
                  }
                  setImageError("");
                  setImageName(f.name);
                  setImageFile(f);
                  const reader = new FileReader();
                  reader.onload = () => setImage(String(reader.result));
                  reader.readAsDataURL(f);
                }}
              />
            </label>
            <p
              className={`mt-3 text-[10px] leading-4 ${
                imageError ? "text-destructive-color" : "text-secondary-text"
              }`}
            >
              {imageError ||
                imageName ||
                (image
                  ? "Imagem atual do produto."
                  : "Use um arquivo JPG ou PNG de até 5 MB.")}
            </p>
          </div>

          <div>
            <p className="mb-3 font-semibold">Dados do produto</p>
            <label className="mb-4 block text-[12px]">
              Nome do produto
              <input
                required
                disabled={isSubmitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome do produto"
                className={`${inputClass} mt-1 text-[14px]`}
              />
            </label>
            <label className="mb-4 block text-[12px]">
              Descrição
              <input
                disabled={isSubmitting}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Digite uma descrição para o produto (opcional)"
                className={`${inputClass} mt-1 text-[14px]`}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="text-[12px]">
                Preço de venda
                <input
                  required
                  disabled={isSubmitting}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="R$ 0,00"
                  className={`${inputClass} mt-1 text-[14px]`}
                />
              </label>
              <label className="text-[12px]">
                Status do produto
                <select
                  required
                  disabled={isSubmitting}
                  value={active}
                  onChange={(e) => setActive(e.target.value)}
                  className={`${inputClass} mt-1 text-[14px]`}
                >
                  <option value="">Selecione o status</option>
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
              </label>
            </div>
            <div className="my-4 h-px bg-[#e7ebf3]" />
            <div className="grid grid-cols-2 gap-4">
              <label className="text-[12px]">
                Código
                <input
                  required
                  disabled={isSubmitting}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  readOnly={mode === "edit"}
                  placeholder="Digite o código"
                  className={`${inputClass} mt-1 text-[14px] ${
                    mode === "edit" ? "bg-[#f5f7ff]" : ""
                  }`}
                />
              </label>
              <label className="text-[12px]">
                Quantidade em estoque
                <div className="mt-1 flex h-[56px] items-center rounded-[10px] border border-input-stroke bg-white px-3 focus-within:border-accent-color">
                  <button
                    type="button"
                    disabled={isSubmitting || (parseInt(quantity, 10) || 0) <= 0}
                    onClick={() => handleQuantityDelta(-1)}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-accent-color transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    −
                  </button>
                  <input
                    required
                    disabled={isSubmitting}
                    type="number"
                    min="0"
                    step="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    placeholder="0"
                    className="h-full flex-1 bg-transparent px-2 text-center text-[16px] font-semibold text-[#1f2937] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleQuantityDelta(1)}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-accent-color transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </label>
            </div>
            {mode === "edit" && (
              <p className="text-secondary-text mt-4 text-[11px]">
                O código é fixo para identificação. A quantidade e demais dados podem ser alterados e salvos.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#e7ebf3] p-5">
          <p className="text-secondary-text text-[10px]">
            {mode === "edit" ? "As alterações serão aplicadas ao salvar." : ""}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={cancel}
              disabled={isSubmitting}
              className={`${buttonClass} border-input-stroke text-accent-color border bg-white`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${buttonClass} bg-accent-color text-white`}
            >
              {isSubmitting ? (
                <PulseLoader color="#ffffff" size={8} margin={2} />
              ) : mode === "edit" ? (
                "Salvar alterações"
              ) : (
                "Adicionar produto"
              )}
            </button>
          </div>
        </div>
      </form>

      <button
        onClick={cancel}
        disabled={isSubmitting}
        className="text-accent-color mt-5 cursor-pointer text-[14px] font-medium"
      >
        ← Voltar ao estoque
      </button>
    </div>
  );
};

export default ProductForm;
