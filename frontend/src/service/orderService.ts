import { supabase } from "../lib/supabase/supabaseclient.ts";
import { productService, type Product } from "./productService.ts";

export type OrderStatusDB = "ABERTO" | "CONFIRMADO" | "ENTREGUE" | "CANCELADO";
export type OrderStatusUI =
  | "Pendente"
  | "Em andamento"
  | "Entregue"
  | "Cancelado";

export type PaymentMethodDB = "PIX" | "DINHEIRO" | "CARTAO";
export type DeliveryTypeDB = "ENTREGA" | "RETIRADA";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  createdAt: string;
};

export type CustomerInput = {
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  createdAt?: string;
};

export type OrderItem = {
  id?: string;
  productId: string;
  productName: string;
  productCode: string;
  productActive: boolean;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Order = {
  id: string;
  displayCode: string;
  customerId: string;
  customerName: string;
  customer?: Customer;
  userId?: string | null;
  orderDate: string;
  status: OrderStatusUI;
  statusDb: OrderStatusDB;
  paymentMethod: PaymentMethodDB;
  deliveryType: DeliveryTypeDB;
  observation: string;
  items: OrderItem[];
  totalValue: number;
  totalUnits: number;
};

export type OrderFilters = {
  customerName: string;
  status: string;
  minDate: string;
  maxDate: string;
  minValue: string;
  maxValue: string;
};

export type OrderSortField = "date" | "value" | "customer";

export type OrderSort = {
  field: OrderSortField;
  ascending: boolean;
};

export type SaveOrderPayload = {
  customerMode: "new" | "existing";
  existingCustomerId?: string;
  newCustomer?: CustomerInput;
  orderDate: string;
  status: OrderStatusUI;
  paymentMethod: PaymentMethodDB;
  deliveryType: DeliveryTypeDB;
  observation?: string;
  items: OrderItem[];
};

const STATUS_UI_TO_DB: Record<OrderStatusUI, OrderStatusDB> = {
  Pendente: "ABERTO",
  "Em andamento": "CONFIRMADO",
  Entregue: "ENTREGUE",
  Cancelado: "CANCELADO",
};

const STATUS_DB_TO_UI: Record<string, OrderStatusUI> = {
  ABERTO: "Pendente",
  CONFIRMADO: "Em andamento",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

type RawCustomerRow = {
  ID_CLIENTE: string;
  NOME: string;
  EMAIL?: string | null;
  TELEFONE?: string | null;
  CPF_CNPJ?: string | null;
  DATA_CADASTRO?: string | null;
};

type RawProductRow = {
  ID_PRODUTO: string;
  NOME: string;
  CODIGO: string;
  PRECO: number | string;
  ATIVO: boolean;
  IMAGEM?: string | null;
};

type RawOrderItemRow = {
  ID_ITEM: string;
  ID_PEDIDO: string;
  ID_PRODUTO: string;
  QUANTIDADE: number | string;
  SUBTOTAL: number | string;
  Produto?: RawProductRow | null;
};

type RawOrderRow = {
  ID_PEDIDO: string;
  ID_CLIENTE: string;
  ID_USUARIO?: string | null;
  DATA_PEDIDO: string;
  STATUS: string;
  OBSERVACAO?: string | null;
  FORMA_PAGAMENTO?: PaymentMethodDB | null;
  TIPO_RECEBIMENTO?: DeliveryTypeDB | null;
  Cliente?: RawCustomerRow | null;
  Item_Pedido?: RawOrderItemRow[] | null;
};

const normalizeCustomer = (row: RawCustomerRow): Customer => ({
  id: String(row.ID_CLIENTE),
  name: String(row.NOME ?? ""),
  email: String(row.EMAIL ?? ""),
  phone: String(row.TELEFONE ?? ""),
  cpfCnpj: String(row.CPF_CNPJ ?? ""),
  createdAt: row.DATA_CADASTRO
    ? String(row.DATA_CADASTRO).slice(0, 10)
    : new Date().toISOString().slice(0, 10),
});

const buildDisplayCode = (id: string, index: number): string => {
  const numericHash = id
    .replace(/[^0-9]/g, "")
    .slice(0, 4);
  if (numericHash.length === 4) {
    return `#${numericHash}`;
  }
  return `#${String(1000 + index + 1)}`;
};

const normalizeOrder = (row: RawOrderRow, index: number): Order => {
  const customer = row.Cliente ? normalizeCustomer(row.Cliente) : undefined;
  const rawItems = row.Item_Pedido ?? [];

  const items: OrderItem[] = rawItems.map((item) => {
    const quantity = Number(item.QUANTIDADE ?? 1);
    const subtotal = Number(item.SUBTOTAL ?? 0);
    const productPrice = item.Produto
      ? Number(item.Produto.PRECO ?? 0)
      : quantity > 0
        ? subtotal / quantity
        : 0;

    return {
      id: String(item.ID_ITEM),
      productId: String(item.ID_PRODUTO),
      productName: item.Produto?.NOME ?? "Produto",
      productCode: item.Produto?.CODIGO ?? "—",
      productActive: item.Produto?.ATIVO ?? true,
      productImage: item.Produto?.IMAGEM ?? undefined,
      quantity,
      unitPrice: productPrice,
      subtotal: subtotal || quantity * productPrice,
    };
  });

  const totalValue = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const statusUi = STATUS_DB_TO_UI[row.STATUS] ?? "Pendente";
  const statusDb = (STATUS_UI_TO_DB[statusUi] ?? "ABERTO") as OrderStatusDB;

  return {
    id: String(row.ID_PEDIDO),
    displayCode: buildDisplayCode(String(row.ID_PEDIDO), index),
    customerId: String(row.ID_CLIENTE),
    customerName: customer?.name || "Cliente não identificado",
    customer,
    userId: row.ID_USUARIO ?? null,
    orderDate: row.DATA_PEDIDO
      ? String(row.DATA_PEDIDO).slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    status: statusUi,
    statusDb,
    paymentMethod: (row.FORMA_PAGAMENTO as PaymentMethodDB) ?? "PIX",
    deliveryType: (row.TIPO_RECEBIMENTO as DeliveryTypeDB) ?? "ENTREGA",
    observation: String(row.OBSERVACAO ?? ""),
    items,
    totalValue,
    totalUnits,
  };
};

export const extractDigits = (value: string): string =>
  value.replace(/\D/g, "");

export const formatCpfCnpj = (value: string): string => {
  const digits = extractDigits(value).slice(0, 14);

  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

export const isValidCpf = (rawCpf: string): boolean => {
  const cpf = extractDigits(rawCpf);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(cpf[i]) * (10 - i);
  }
  let firstCheck = (sum * 10) % 11;
  if (firstCheck === 10) firstCheck = 0;
  if (firstCheck !== Number(cpf[9])) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(cpf[i]) * (11 - i);
  }
  let secondCheck = (sum * 10) % 11;
  if (secondCheck === 10) secondCheck = 0;
  return secondCheck === Number(cpf[10]);
};

export const isValidCnpj = (rawCnpj: string): boolean => {
  const cnpj = extractDigits(rawCnpj);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const calcDigit = (base: string, weights: number[]): number => {
    const total = weights.reduce(
      (acc, weight, idx) => acc + Number(base[idx]) * weight,
      0,
    );
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const firstCheck = calcDigit(cnpj.slice(0, 12), firstWeights);
  if (firstCheck !== Number(cnpj[12])) return false;

  const secondCheck = calcDigit(cnpj.slice(0, 13), secondWeights);
  return secondCheck === Number(cnpj[13]);
};

export const isValidCpfOrCnpj = (value: string): boolean => {
  const digits = extractDigits(value);
  if (digits.length === 11) return isValidCpf(digits);
  if (digits.length === 14) return isValidCnpj(digits);
  return false;
};

export const validateCustomerInput = (input?: CustomerInput): string | null => {
  if (!input) {
    return "Preencha os dados do cliente.";
  }
  if (!input.name.trim() || input.name.trim().length < 2) {
    return "Informe o nome do cliente (mínimo 2 caracteres).";
  }
  if (!input.cpfCnpj.trim()) {
    return "Informe o CPF ou CNPJ do cliente.";
  }
  if (!isValidCpfOrCnpj(input.cpfCnpj)) {
    return "O CPF ou CNPJ informado é inválido. Verifique os dígitos.";
  }
  if (!input.email.trim() || !input.email.includes("@")) {
    return "Informe um e-mail válido para o cliente.";
  }
  if (!input.phone.trim()) {
    return "Informe o telefone do cliente.";
  }
  return null;
};

export const validateOrderPayload = (
  payload: SaveOrderPayload,
): string | null => {
  if (payload.customerMode === "existing") {
    if (!payload.existingCustomerId) {
      return "Selecione um cliente para o pedido.";
    }
  } else {
    const customerError = validateCustomerInput(payload.newCustomer);
    if (customerError) {
      return customerError;
    }
  }

  if (!payload.orderDate) {
    return "Informe a data do pedido.";
  }

  if (
    !["Pendente", "Em andamento", "Entregue", "Cancelado"].includes(
      payload.status,
    )
  ) {
    return "Selecione um estado válido para o pedido.";
  }

  if (!payload.items || payload.items.length === 0) {
    return "Adicione pelo menos um produto ao pedido.";
  }

  for (const item of payload.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return `A quantidade do produto "${item.productName}" deve ser maior que zero.`;
    }
  }

  return null;
};

type ExpectedStockState = {
  productId: string;
  expectedQuantity: number;
  expectedActive: boolean;
};

const prepareAndValidateStockDeltas = async (
  oldItems: { productId: string; quantity: number }[],
  newItems: { productId: string; quantity: number }[],
): Promise<ExpectedStockState[]> => {
  const deltaByProduct = new Map<string, number>();

  for (const oldItem of oldItems) {
    deltaByProduct.set(
      oldItem.productId,
      (deltaByProduct.get(oldItem.productId) ?? 0) - Number(oldItem.quantity),
    );
  }

  for (const newItem of newItems) {
    deltaByProduct.set(
      newItem.productId,
      (deltaByProduct.get(newItem.productId) ?? 0) + Number(newItem.quantity),
    );
  }

  const affectedProductIds = Array.from(deltaByProduct.keys()).filter(
    (id) => (deltaByProduct.get(id) ?? 0) !== 0,
  );

  if (affectedProductIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("Produto")
    .select("ID_PRODUTO, NOME, QUANTIDADE_ESTOQUE, ATIVO")
    .in("ID_PRODUTO", affectedProductIds);

  if (error) {
    throw new Error(`Erro ao verificar estoque dos produtos: ${error.message}`);
  }

  const productRows = (data ?? []) as {
    ID_PRODUTO: string;
    NOME: string;
    QUANTIDADE_ESTOQUE: number | string;
    ATIVO: boolean;
  }[];

  const rowMap = new Map(productRows.map((r) => [String(r.ID_PRODUTO), r]));
  const expectedStates: ExpectedStockState[] = [];

  for (const productId of affectedProductIds) {
    const delta = deltaByProduct.get(productId) ?? 0;
    const row = rowMap.get(productId);

    if (!row) {
      throw new Error("Um dos produtos selecionados não foi encontrado no estoque.");
    }

    const currentStock = Number(row.QUANTIDADE_ESTOQUE ?? 0);
    if (delta > 0 && currentStock < delta) {
      throw new Error(
        `Estoque insuficiente para o produto "${row.NOME}". Disponível: ${currentStock}, Solicitado: ${delta}.`,
      );
    }

    const expectedQuantity = Math.max(0, currentStock - delta);
    const expectedActive =
      expectedQuantity <= 0
        ? false
        : delta < 0
          ? true
          : Boolean(row.ATIVO);

    expectedStates.push({
      productId,
      expectedQuantity,
      expectedActive,
    });
  }

  return expectedStates;
};

const ensureStockSynchronized = async (
  expectedStates: ExpectedStockState[],
): Promise<void> => {
  if (expectedStates.length === 0) return;

  const productIds = expectedStates.map((s) => s.productId);
  const { data, error } = await supabase
    .from("Produto")
    .select("ID_PRODUTO, QUANTIDADE_ESTOQUE, ATIVO")
    .in("ID_PRODUTO", productIds);

  if (error) {
    throw new Error(`Erro ao sincronizar estoque: ${error.message}`);
  }

  const currentMap = new Map(
    ((data ?? []) as {
      ID_PRODUTO: string;
      QUANTIDADE_ESTOQUE: number | string;
      ATIVO: boolean;
    }[]).map((r) => [String(r.ID_PRODUTO), r]),
  );

  for (const state of expectedStates) {
    const current = currentMap.get(state.productId);
    if (!current) continue;

    const currentQty = Number(current.QUANTIDADE_ESTOQUE ?? 0);
    const currentActive = Boolean(current.ATIVO);

    if (
      currentQty !== state.expectedQuantity ||
      currentActive !== state.expectedActive
    ) {
      const { error: updateErr } = await supabase
        .from("Produto")
        .update({
          QUANTIDADE_ESTOQUE: state.expectedQuantity,
          ATIVO: state.expectedActive,
        })
        .eq("ID_PRODUTO", state.productId);

      if (updateErr) {
        throw new Error(
          `Erro ao atualizar estoque do produto: ${updateErr.message}`,
        );
      }
    }
  }
};

const resolveAuthenticatedUserId = async (): Promise<string | null> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const authUserId = sessionData.session?.user?.id;

  if (authUserId) {
    const { data: existingUser } = await supabase
      .from("Usuarios")
      .select("ID_USUARIO")
      .eq("ID_USUARIO", authUserId)
      .maybeSingle();

    if (existingUser?.ID_USUARIO) {
      return String(existingUser.ID_USUARIO);
    }
  }

  const { data: fallbackUser } = await supabase
    .from("Usuarios")
    .select("ID_USUARIO")
    .limit(1)
    .maybeSingle();

  return fallbackUser?.ID_USUARIO ? String(fallbackUser.ID_USUARIO) : null;
};

export const orderService = {
  getCustomers: async (): Promise<Customer[]> => {
    const { data, error } = await supabase
      .from("Cliente")
      .select("ID_CLIENTE, NOME, EMAIL, TELEFONE, CPF_CNPJ, DATA_CADASTRO")
      .order("NOME", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as RawCustomerRow[]).map(normalizeCustomer);
  },

  checkCpfCnpjExists: async (
    cpfCnpj: string,
    excludeCustomerId?: string,
  ): Promise<boolean> => {
    const targetDigits = extractDigits(cpfCnpj);
    if (!targetDigits) return false;

    const { data, error } = await supabase
      .from("Cliente")
      .select("ID_CLIENTE, CPF_CNPJ");

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []) as {
      ID_CLIENTE: string;
      CPF_CNPJ?: string | null;
    }[];

    return rows.some(
      (row) =>
        row.ID_CLIENTE !== excludeCustomerId &&
        extractDigits(String(row.CPF_CNPJ ?? "")) === targetDigits,
    );
  },

  createCustomer: async (input: CustomerInput): Promise<Customer> => {
    const validationError = validateCustomerInput(input);
    if (validationError) {
      throw new Error(validationError);
    }

    const cpfAlreadyExists = await orderService.checkCpfCnpjExists(
      input.cpfCnpj,
    );
    if (cpfAlreadyExists) {
      throw new Error("Já existe um cliente cadastrado com este CPF/CNPJ.");
    }

    const formattedDocument = formatCpfCnpj(input.cpfCnpj);

    const { data, error } = await supabase
      .from("Cliente")
      .insert([
        {
          ID_CLIENTE: crypto.randomUUID(),
          NOME: input.name.trim(),
          EMAIL: input.email.trim(),
          TELEFONE: input.phone.trim(),
          CPF_CNPJ: formattedDocument,
          DATA_CADASTRO:
            input.createdAt || new Date().toISOString().slice(0, 10),
        },
      ])
      .select("ID_CLIENTE, NOME, EMAIL, TELEFONE, CPF_CNPJ, DATA_CADASTRO")
      .single();

    if (error) {
      throw new Error(`Erro ao cadastrar cliente: ${error.message}`);
    }

    return normalizeCustomer(data as RawCustomerRow);
  },

  getAvailableProducts: async (): Promise<Product[]> => {
    return productService.getProducts(undefined, {
      field: "name",
      ascending: true,
    });
  },

  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from("Pedido")
      .select("*, Cliente(*), Item_Pedido(*, Produto(*))")
      .order("DATA_PEDIDO", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []) as RawOrderRow[];
    return rows.map((row, idx) => normalizeOrder(row, rows.length - 1 - idx));
  },

  createOrder: async (payload: SaveOrderPayload): Promise<Order> => {
    const validationError = validateOrderPayload(payload);
    if (validationError) {
      throw new Error(validationError);
    }

    const expectedStockStates = await prepareAndValidateStockDeltas(
      [],
      payload.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    );

    let customerId = payload.existingCustomerId ?? "";
    if (payload.customerMode === "new" && payload.newCustomer) {
      const createdCustomer = await orderService.createCustomer(
        payload.newCustomer,
      );
      customerId = createdCustomer.id;
    }

    const userId = await resolveAuthenticatedUserId();
    const orderId = crypto.randomUUID();
    const statusDb = STATUS_UI_TO_DB[payload.status] ?? "ABERTO";

    const { error: orderError } = await supabase.from("Pedido").insert([
      {
        ID_PEDIDO: orderId,
        ID_CLIENTE: customerId,
        ID_USUARIO: userId,
        DATA_PEDIDO: payload.orderDate,
        STATUS: statusDb,
        FORMA_PAGAMENTO: payload.paymentMethod || "PIX",
        TIPO_RECEBIMENTO: payload.deliveryType || "ENTREGA",
        OBSERVACAO: payload.observation?.trim() ?? "",
      },
    ]);

    if (orderError) {
      throw new Error(`Erro ao criar pedido: ${orderError.message}`);
    }

    const itemsToInsert = payload.items.map((item) => ({
      ID_ITEM: crypto.randomUUID(),
      ID_PEDIDO: orderId,
      ID_PRODUTO: item.productId,
      QUANTIDADE: Number(item.quantity),
      SUBTOTAL: Number((item.quantity * item.unitPrice).toFixed(2)),
    }));

    const { error: itemsError } = await supabase
      .from("Item_Pedido")
      .insert(itemsToInsert);

    if (itemsError) {
      await supabase.from("Pedido").delete().eq("ID_PEDIDO", orderId);
      throw new Error(
        `Erro ao salvar itens do pedido: ${itemsError.message}`,
      );
    }

    await ensureStockSynchronized(expectedStockStates);

    const { data: fullOrder, error: fetchError } = await supabase
      .from("Pedido")
      .select("*, Cliente(*), Item_Pedido(*, Produto(*))")
      .eq("ID_PEDIDO", orderId)
      .single();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    return normalizeOrder(fullOrder as RawOrderRow, 0);
  },

  updateOrder: async (
    orderId: string,
    payload: SaveOrderPayload,
  ): Promise<Order> => {
    const validationError = validateOrderPayload(payload);
    if (validationError) {
      throw new Error(validationError);
    }

    const { data: existingItemsData, error: existingItemsError } =
      await supabase
        .from("Item_Pedido")
        .select("ID_PRODUTO, QUANTIDADE")
        .eq("ID_PEDIDO", orderId);

    if (existingItemsError) {
      throw new Error(
        `Erro ao consultar itens atuais do pedido: ${existingItemsError.message}`,
      );
    }

    const oldItems = (
      (existingItemsData ?? []) as {
        ID_PRODUTO: string;
        QUANTIDADE: number | string;
      }[]
    ).map((r) => ({
      productId: String(r.ID_PRODUTO),
      quantity: Number(r.QUANTIDADE ?? 0),
    }));

    const expectedStockStates = await prepareAndValidateStockDeltas(
      oldItems,
      payload.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    );

    let customerId = payload.existingCustomerId ?? "";
    if (payload.customerMode === "new" && payload.newCustomer) {
      const createdCustomer = await orderService.createCustomer(
        payload.newCustomer,
      );
      customerId = createdCustomer.id;
    }

    const statusDb = STATUS_UI_TO_DB[payload.status] ?? "ABERTO";

    const { error: updateError } = await supabase
      .from("Pedido")
      .update({
        ID_CLIENTE: customerId,
        DATA_PEDIDO: payload.orderDate,
        STATUS: statusDb,
        FORMA_PAGAMENTO: payload.paymentMethod || "PIX",
        TIPO_RECEBIMENTO: payload.deliveryType || "ENTREGA",
        OBSERVACAO: payload.observation?.trim() ?? "",
      })
      .eq("ID_PEDIDO", orderId);

    if (updateError) {
      throw new Error(`Erro ao atualizar pedido: ${updateError.message}`);
    }

    const { error: deleteItemsError } = await supabase
      .from("Item_Pedido")
      .delete()
      .eq("ID_PEDIDO", orderId);

    if (deleteItemsError) {
      throw new Error(
        `Erro ao atualizar itens do pedido: ${deleteItemsError.message}`,
      );
    }

    const itemsToInsert = payload.items.map((item) => ({
      ID_ITEM: crypto.randomUUID(),
      ID_PEDIDO: orderId,
      ID_PRODUTO: item.productId,
      QUANTIDADE: Number(item.quantity),
      SUBTOTAL: Number((item.quantity * item.unitPrice).toFixed(2)),
    }));

    const { error: insertItemsError } = await supabase
      .from("Item_Pedido")
      .insert(itemsToInsert);

    if (insertItemsError) {
      throw new Error(
        `Erro ao salvar novos itens do pedido: ${insertItemsError.message}`,
      );
    }

    await ensureStockSynchronized(expectedStockStates);

    const { data: fullOrder, error: fetchError } = await supabase
      .from("Pedido")
      .select("*, Cliente(*), Item_Pedido(*, Produto(*))")
      .eq("ID_PEDIDO", orderId)
      .single();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    return normalizeOrder(fullOrder as RawOrderRow, 0);
  },

  deleteOrder: async (orderId: string): Promise<void> => {
    const { data: existingItemsData } = await supabase
      .from("Item_Pedido")
      .select("ID_PRODUTO, QUANTIDADE")
      .eq("ID_PEDIDO", orderId);

    const oldItems = (
      (existingItemsData ?? []) as {
        ID_PRODUTO: string;
        QUANTIDADE: number | string;
      }[]
    ).map((r) => ({
      productId: String(r.ID_PRODUTO),
      quantity: Number(r.QUANTIDADE ?? 0),
    }));

    const expectedStockStates = await prepareAndValidateStockDeltas(
      oldItems,
      [],
    );

    const { error: deleteItemsError } = await supabase
      .from("Item_Pedido")
      .delete()
      .eq("ID_PEDIDO", orderId);

    if (deleteItemsError) {
      throw new Error(deleteItemsError.message);
    }

    await ensureStockSynchronized(expectedStockStates);

    const { error } = await supabase
      .from("Pedido")
      .delete()
      .eq("ID_PEDIDO", orderId);

    if (error) {
      throw new Error(error.message);
    }
  },
};
