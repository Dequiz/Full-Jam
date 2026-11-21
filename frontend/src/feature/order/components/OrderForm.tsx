import { useMemo, useState, type FormEvent } from "react";
import { PulseLoader } from "react-spinners";
import { toast } from "sonner";
import {
  extractDigits,
  formatCpfCnpj,
  isValidCpfOrCnpj,
  type Customer,
  type DeliveryTypeDB,
  type Order,
  type OrderItem,
  type OrderStatusUI,
  type PaymentMethodDB,
  type SaveOrderPayload,
} from "../../../service/orderService.ts";
import type { Product } from "../../../service/productService.ts";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const inputClass =
  "h-[48px] w-full rounded-[10px] border border-input-stroke bg-white px-4 text-[15px] text-[#1f2937] outline-none transition placeholder:text-secondary-text focus:border-accent-color disabled:bg-slate-100";

const buttonClass =
  "flex h-[48px] items-center justify-center rounded-[10px] px-6 text-[15px] font-semibold cursor-pointer transition disabled:cursor-not-allowed disabled:opacity-60";

type OrderFormProps = {
  mode: "add" | "edit";
  initial?: Order;
  customers: Customer[];
  products: Product[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSave: (payload: SaveOrderPayload) => Promise<void>;
};

const OrderForm = ({
  mode,
  initial,
  customers,
  products,
  isSubmitting,
  onCancel,
  onSave,
}: OrderFormProps) => {
  const todayIso = new Date().toISOString().slice(0, 10);

  const [customerMode, setCustomerMode] = useState<"new" | "existing">(
    mode === "edit" && initial?.customerId ? "existing" : "new",
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initial?.customerId ?? customers[0]?.id ?? "",
  );

  const [customerName, setCustomerName] = useState(
    initial?.customer?.name ?? "",
  );
  const [customerEmail, setCustomerEmail] = useState(
    initial?.customer?.email ?? "",
  );
  const [customerPhone, setCustomerPhone] = useState(
    initial?.customer?.phone ?? "",
  );
  const [customerCpfCnpj, setCustomerCpfCnpj] = useState(
    initial?.customer?.cpfCnpj ?? "",
  );
  const [customerCreatedAt, setCustomerCreatedAt] = useState(
    initial?.customer?.createdAt ?? todayIso,
  );

  const [orderDate, setOrderDate] = useState(initial?.orderDate ?? todayIso);
  const [status, setStatus] = useState<OrderStatusUI>(
    initial?.status ?? "Pendente",
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodDB>(
    initial?.paymentMethod ?? "PIX",
  );
  const [deliveryType, setDeliveryType] = useState<DeliveryTypeDB>(
    initial?.deliveryType ?? "ENTREGA",
  );
  const [observation, setObservation] = useState(initial?.observation ?? "");

  const [items, setItems] = useState<OrderItem[]>(initial?.items ?? []);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id ?? "",
  );

  const selectedExistingCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId],
  );

  const totalUnits = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );

  const totalValue = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
    [items],
  );

  const initialQuantitiesByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of initial?.items ?? []) {
      map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
    }
    return map;
  }, [initial]);

  const getMaxAvailableStock = (productId: string): number => {
    const product = products.find((p) => p.id === productId);
    const currentDbStock = product?.quantity ?? 0;
    const reservedByCurrentOrder =
      initialQuantitiesByProduct.get(productId) ?? 0;
    return currentDbStock + reservedByCurrentOrder;
  };

  const handleAddProduct = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      toast.error("Selecione um produto para adicionar ao pedido.");
      return;
    }

    const maxStock = getMaxAvailableStock(product.id);
    if (!product.active && maxStock <= 0) {
      toast.error("Este produto está inativo e sem estoque disponível.");
      return;
    }

    if (maxStock <= 0) {
      toast.error(
        `O produto "${product.name}" não possui unidades disponíveis em estoque.`,
      );
      return;
    }

    const existingItem = items.find((i) => i.productId === product.id);
    const nextRequestedQty = (existingItem?.quantity ?? 0) + 1;

    if (nextRequestedQty > maxStock) {
      toast.error(
        `Estoque insuficiente para "${product.name}". Disponível: ${maxStock} un.`,
      );
      return;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === product.id);
      if (existingIndex >= 0) {
        return prev.map((item, idx) => {
          if (idx !== existingIndex) return item;
          const nextQty = item.quantity + 1;
          return {
            ...item,
            quantity: nextQty,
            subtotal: Number((nextQty * item.unitPrice).toFixed(2)),
          };
        });
      }

      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          productActive: product.active || maxStock > 0,
          productImage: product.image,
          quantity: 1,
          unitPrice: product.price,
          subtotal: product.price,
        },
      ];
    });
  };

  const handleChangeItemQuantity = (productId: string, delta: number) => {
    const currentItem = items.find((i) => i.productId === productId);
    if (!currentItem) return;

    const nextQty = Math.max(1, currentItem.quantity + delta);
    handleSetItemQuantity(productId, nextQty);
  };

  const handleSetItemQuantity = (productId: string, rawQty: number) => {
    const currentItem = items.find((i) => i.productId === productId);
    if (!currentItem) return;

    const maxStock = getMaxAvailableStock(productId);
    const validQty = Math.max(1, Math.min(rawQty, maxStock));

    if (rawQty > maxStock) {
      toast.error(
        `Estoque máximo disponível para "${currentItem.productName}": ${maxStock} un.`,
      );
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        return {
          ...item,
          quantity: validQty,
          subtotal: Number((validQty * item.unitPrice).toFixed(2)),
        };
      }),
    );
  };

  const handleRemoveItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (customerMode === "new") {
      if (!isValidCpfOrCnpj(customerCpfCnpj)) {
        toast.error("O CPF ou CNPJ informado é inválido. Verifique os dígitos.");
        return;
      }

      const typedDigits = extractDigits(customerCpfCnpj);
      const duplicateCustomer = customers.some(
        (c) => extractDigits(c.cpfCnpj) === typedDigits,
      );
      if (duplicateCustomer) {
        toast.error("Já existe um cliente cadastrado com este CPF/CNPJ.");
        return;
      }
    }

    await onSave({
      customerMode,
      existingCustomerId:
        customerMode === "existing" ? selectedCustomerId : undefined,
      newCustomer:
        customerMode === "new"
          ? {
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
              cpfCnpj: customerCpfCnpj,
              createdAt: customerCreatedAt,
            }
          : undefined,
      orderDate,
      status,
      paymentMethod,
      deliveryType,
      observation,
      items,
    });
  };

  const title = mode === "edit" ? "Editar pedido" : "Adicionar pedido";

  return (
    <div className="stock-dissolve max-w-[1030px]">
      <div className="mb-4 flex items-center gap-3 text-[14px]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-accent-color cursor-pointer font-medium"
        >
          Pedidos
        </button>
        <span className="text-secondary-text">›</span>
        <span className="text-secondary-text">{title}</span>
      </div>

      <h1 className="text-[32px] font-bold text-[#111827]">{title}</h1>
      <p className="text-secondary-text mt-1 mb-7 text-[14px]">
        Preencha os dados do cliente e selecione os produtos do novo pedido.
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-7">
        {/* Card: Dados do pedido + Entidade Cliente */}
        <section className="border-input-stroke rounded-[15px] border bg-white p-6 shadow-[0_2px_10px_rgba(20,32,61,0.04)]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[18px] font-bold text-[#111827]">
              Dados do pedido
            </h2>

            <div className="flex rounded-[10px] border border-[#e7ebf3] bg-slate-50 p-1 text-[12px] font-semibold">
              <button
                type="button"
                onClick={() => setCustomerMode("new")}
                className={`cursor-pointer rounded-[8px] px-3 py-1.5 transition ${
                  customerMode === "new"
                    ? "bg-accent-color text-white shadow-xs"
                    : "text-secondary-text hover:text-[#111827]"
                }`}
              >
                + Novo cliente
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode("existing")}
                disabled={customers.length === 0}
                className={`cursor-pointer rounded-[8px] px-3 py-1.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  customerMode === "existing"
                    ? "bg-accent-color text-white shadow-xs"
                    : "text-secondary-text hover:text-[#111827]"
                }`}
              >
                Cliente cadastrado ({customers.length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px_200px]">
            {customerMode === "existing" ? (
              <label className="block text-[13px] font-semibold text-[#1f2937]">
                Cliente
                <select
                  value={selectedCustomerId}
                  disabled={isSubmitting}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className={`${inputClass} mt-1.5 cursor-pointer`}
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.cpfCnpj ? `— ${c.cpfCnpj}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="block text-[13px] font-semibold text-[#1f2937]">
                Cliente (Nome completo)
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Maria Silva"
                  className={`${inputClass} mt-1.5`}
                />
              </label>
            )}

            <label className="block text-[13px] font-semibold text-[#1f2937]">
              Data do pedido
              <input
                type="date"
                required
                disabled={isSubmitting}
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className={`${inputClass} mt-1.5`}
              />
            </label>

            <label className="block text-[13px] font-semibold text-[#1f2937]">
              Estado do pedido
              <select
                value={status}
                disabled={isSubmitting}
                onChange={(e) => setStatus(e.target.value as OrderStatusUI)}
                className={`${inputClass} mt-1.5 cursor-pointer`}
              >
                <option value="Pendente">Pendente</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Entregue">Entregue</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </label>
          </div>

          {/* Campos completos da entidade Cliente (quando criando novo cliente) */}
          {customerMode === "new" ? (
            <div className="mt-4 rounded-[12px] border border-[#e7ebf3] bg-[#f8faff] p-4">
              <p className="text-accent-color mb-3 text-[12px] font-semibold">
                Dados da entidade Cliente (será cadastrado automaticamente no
                banco)
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block text-[12px] font-medium text-[#1f2937]">
                  CPF / CNPJ
                  <input
                    type="text"
                    required
                    maxLength={18}
                    disabled={isSubmitting}
                    value={customerCpfCnpj}
                    onChange={(e) =>
                      setCustomerCpfCnpj(formatCpfCnpj(e.target.value))
                    }
                    placeholder="000.000.000-00"
                    className={`${inputClass} mt-1 h-[42px] text-[14px]`}
                  />
                </label>

                <label className="block text-[12px] font-medium text-[#1f2937]">
                  E-mail do cliente
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className={`${inputClass} mt-1 h-[42px] text-[14px]`}
                  />
                </label>

                <label className="block text-[12px] font-medium text-[#1f2937]">
                  Telefone
                  <input
                    type="tel"
                    required
                    disabled={isSubmitting}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={`${inputClass} mt-1 h-[42px] text-[14px]`}
                  />
                </label>

                <label className="block text-[12px] font-medium text-[#1f2937]">
                  Data de cadastro
                  <input
                    type="date"
                    required
                    disabled={isSubmitting}
                    value={customerCreatedAt}
                    onChange={(e) => setCustomerCreatedAt(e.target.value)}
                    className={`${inputClass} mt-1 h-[42px] text-[14px]`}
                  />
                </label>
              </div>
            </div>
          ) : (
            selectedExistingCustomer && (
              <div className="mt-4 flex flex-wrap gap-6 rounded-[12px] border border-[#e7ebf3] bg-[#f8faff] px-4 py-3 text-[12px] text-[#464D59]">
                <span>
                  <strong className="text-[#1f2937]">CPF/CNPJ:</strong>{" "}
                  {selectedExistingCustomer.cpfCnpj || "—"}
                </span>
                <span>
                  <strong className="text-[#1f2937]">E-mail:</strong>{" "}
                  {selectedExistingCustomer.email || "—"}
                </span>
                <span>
                  <strong className="text-[#1f2937]">Telefone:</strong>{" "}
                  {selectedExistingCustomer.phone || "—"}
                </span>
              </div>
            )
          )}

          {/* Forma de pagamento, tipo de recebimento e observação */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[200px_200px_1fr]">
            <label className="block text-[13px] font-semibold text-[#1f2937]">
              Forma de pagamento
              <select
                value={paymentMethod}
                disabled={isSubmitting}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethodDB)
                }
                className={`${inputClass} mt-1.5 cursor-pointer`}
              >
                <option value="PIX">PIX</option>
                <option value="CARTAO">Cartão</option>
                <option value="DINHEIRO">Dinheiro</option>
              </select>
            </label>

            <label className="block text-[13px] font-semibold text-[#1f2937]">
              Tipo de recebimento
              <select
                value={deliveryType}
                disabled={isSubmitting}
                onChange={(e) =>
                  setDeliveryType(e.target.value as DeliveryTypeDB)
                }
                className={`${inputClass} mt-1.5 cursor-pointer`}
              >
                <option value="ENTREGA">Entrega</option>
                <option value="RETIRADA">Retirada</option>
              </select>
            </label>

            <label className="block text-[13px] font-semibold text-[#1f2937]">
              Observação do pedido (opcional)
              <input
                type="text"
                disabled={isSubmitting}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ex: Entregar no período da manhã"
                className={`${inputClass} mt-1.5`}
              />
            </label>
          </div>
        </section>

        {/* Seção: Produtos do pedido */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-[#111827]">
              Produtos do pedido
            </h2>
            <span className="text-secondary-text text-[13px]">
              {items.length}{" "}
              {items.length === 1
                ? "produto selecionado"
                : "produtos selecionados"}
            </span>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="border-input-stroke flex h-[48px] min-w-[260px] flex-1 items-center gap-3 rounded-[10px] border bg-white px-4">
              <span className="text-secondary-text text-lg">⌕</span>
              <select
                value={selectedProductId}
                disabled={isSubmitting}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full cursor-pointer bg-transparent text-[14px] text-[#1f2937] outline-none"
              >
                {products.length === 0 && (
                  <option value="">Nenhum produto disponível no estoque</option>
                )}
                {products.map((product) => {
                  const available = getMaxAvailableStock(product.id);
                  return (
                    <option key={product.id} value={product.id}>
                      {product.name} — {product.code} (
                      {formatCurrency(product.price)}) • Estoque: {available}{" "}
                      un. • {product.active ? "Ativo" : "Inativo"}
                    </option>
                  );
                })}
              </select>
            </label>

            <button
              type="button"
              disabled={isSubmitting || products.length === 0}
              onClick={handleAddProduct}
              className="border-input-stroke text-accent-color flex h-[48px] cursor-pointer items-center gap-2 rounded-[10px] border bg-white px-5 text-[14px] font-semibold transition hover:bg-[#f5f7ff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-lg">＋</span> Adicionar produto
            </button>
          </div>

          <div className="border-input-stroke overflow-x-auto rounded-[15px] border bg-white">
            <table className="w-full min-w-[680px] border-collapse text-left text-[14px]">
              <thead className="bg-accent-color text-[13px] font-semibold text-white">
                <tr>
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4 text-center">Quantidade</th>
                  <th className="px-6 py-4">Valor unitário</th>
                  <th className="px-6 py-4">Subtotal</th>
                  <th className="w-16 px-4 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.productId}
                    className="border-t border-[#e7ebf3]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt=""
                            className="h-12 w-16 rounded-[6px] object-cover"
                          />
                        ) : (
                          <div className="h-12 w-16 rounded-[6px] bg-slate-100" />
                        )}
                        <div>
                          <p className="font-semibold text-[#111827]">
                            {item.productName}
                          </p>
                          <p className="text-secondary-text text-[11px]">
                            {item.productCode} •{" "}
                            {item.productActive ? "Ativo" : "Inativo"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="border-input-stroke mx-auto flex h-[38px] w-[120px] items-center justify-between rounded-[8px] border bg-white px-2">
                        <button
                          type="button"
                          disabled={isSubmitting || item.quantity <= 1}
                          onClick={() =>
                            handleChangeItemQuantity(item.productId, -1)
                          }
                          className="text-accent-color cursor-pointer px-1 text-base font-bold transition hover:opacity-80 disabled:opacity-30"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={getMaxAvailableStock(item.productId)}
                          disabled={isSubmitting}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            handleSetItemQuantity(
                              item.productId,
                              Number.isNaN(val) ? 1 : val,
                            );
                          }}
                          className="w-12 text-center text-[14px] font-medium text-[#111827] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          disabled={
                            isSubmitting ||
                            item.quantity >=
                              getMaxAvailableStock(item.productId)
                          }
                          onClick={() =>
                            handleChangeItemQuantity(item.productId, 1)
                          }
                          className="text-accent-color cursor-pointer px-1 text-base font-bold transition hover:opacity-80 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-[#1f2937]">
                      {formatCurrency(item.unitPrice)}
                    </td>

                    <td className="px-6 py-4 font-bold text-[#111827]">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        aria-label="Remover item do pedido"
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-secondary-text hover:text-destructive-color cursor-pointer p-1.5 transition"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="size-4 fill-none stroke-current stroke-[1.8]"
                          aria-hidden="true"
                        >
                          <path
                            d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {items.length === 0 && (
              <p className="text-secondary-text p-8 text-center text-[13px]">
                Nenhum produto adicionado ao pedido. Selecione um produto acima e
                clique em &ldquo;+ Adicionar produto&rdquo;.
              </p>
            )}
          </div>
        </section>

        {/* Card: Resumo do pedido */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[15px] bg-[#f5f7ff] px-6 py-5">
          <div>
            <h3 className="text-[15px] font-bold text-[#111827]">
              Resumo do pedido
            </h3>
            <p className="text-secondary-text mt-0.5 text-[13px]">
              {items.length} {items.length === 1 ? "produto" : "produtos"} •{" "}
              {totalUnits} {totalUnits === 1 ? "unidade" : "unidades"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-secondary-text text-[12px]">Total do pedido</p>
            <p className="text-accent-color text-[24px] font-bold">
              {formatCurrency(totalValue)}
            </p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className={`${buttonClass} border-input-stroke text-accent-color border bg-white hover:bg-slate-50`}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`${buttonClass} bg-accent-color text-white hover:opacity-95`}
          >
            {isSubmitting ? (
              <PulseLoader color="#ffffff" size={8} margin={2} />
            ) : mode === "edit" ? (
              "Editar pedido"
            ) : (
              "Adicionar pedido"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
