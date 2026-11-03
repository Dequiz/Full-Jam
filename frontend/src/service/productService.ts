import { supabase } from "../lib/supabase/supabaseclient.ts";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  code: string;
  active: boolean;
  image?: string;
};

export type ProductFilters = {
  name: string;
  code: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  minQuantity: string;
  maxQuantity: string;
};

export type ProductPayload = {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  code: string;
  active: boolean;
  image?: string;
  imageFile?: File | null;
};

const PRODUCTS_TABLE = "Produto";
const PRODUCT_COLUMNS =
  "ID_PRODUTO, NOME, DESCRICAO, PRECO, QUANTIDADE_ESTOQUE, CODIGO, ATIVO";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

type RawProdutoRow = {
  ID_PRODUTO: string;
  NOME: string;
  DESCRICAO?: string | null;
  PRECO: number | string;
  QUANTIDADE_ESTOQUE: number | string;
  CODIGO: string;
  ATIVO: boolean;
};

const normalizeProduct = (row: RawProdutoRow, image?: string): Product => ({
  id: String(row.ID_PRODUTO),
  name: String(row.NOME ?? ""),
  description: String(row.DESCRICAO ?? ""),
  price: Number(row.PRECO ?? 0),
  quantity: Number(row.QUANTIDADE_ESTOQUE ?? 0),
  code: String(row.CODIGO ?? ""),
  active: Boolean(row.ATIVO),
  image,
});

export const validateProductPayload = (
  payload: ProductPayload,
  mode: "add" | "edit",
): string | null => {
  const trimmedName = payload.name.trim();
  const trimmedCode = payload.code.trim();

  if (!trimmedName) {
    return "Informe o nome do produto.";
  }

  if (trimmedName.length < 2) {
    return "O nome do produto deve ter pelo menos 2 caracteres.";
  }

  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    return "Informe um preço de venda válido maior que zero.";
  }

  if (!trimmedCode) {
    return "Informe o código do produto.";
  }

  if (
    !Number.isFinite(payload.quantity) ||
    !Number.isInteger(payload.quantity) ||
    payload.quantity < 0
  ) {
    return "A quantidade em estoque deve ser um número inteiro maior ou igual a zero.";
  }

  if (payload.imageFile) {
    if (!ALLOWED_IMAGE_TYPES.includes(payload.imageFile.type)) {
      return "Escolha um arquivo de imagem no formato JPG ou PNG.";
    }
    if (payload.imageFile.size > MAX_IMAGE_SIZE_BYTES) {
      return "A imagem deve ter no máximo 5 MB.";
    }
  }

  if (mode === "add" && typeof payload.active !== "boolean") {
    return "Selecione o status do produto.";
  }

  return null;
};

export const productService = {
  checkCodeExists: async (
    code: string,
    excludeId?: string,
  ): Promise<boolean> => {
    let queryBuilder = supabase
      .from(PRODUCTS_TABLE)
      .select("ID_PRODUTO")
      .ilike("CODIGO", code.trim());

    if (excludeId !== undefined) {
      queryBuilder = queryBuilder.neq("ID_PRODUTO", excludeId);
    }

    const { data, error } = await queryBuilder.limit(1);

    if (error) {
      throw new Error(error.message);
    }

    return (data?.length ?? 0) > 0;
  },

  getProducts: async (
    filters?: Partial<ProductFilters>,
    sortAscending = true,
  ): Promise<Product[]> => {
    let queryBuilder = supabase
      .from(PRODUCTS_TABLE)
      .select(PRODUCT_COLUMNS)
      .order("NOME", { ascending: sortAscending });

    if (filters?.name?.trim()) {
      queryBuilder = queryBuilder.ilike("NOME", `%${filters.name.trim()}%`);
    }

    if (filters?.code?.trim()) {
      queryBuilder = queryBuilder.ilike("CODIGO", `%${filters.code.trim()}%`);
    }

    if (filters?.status === "Ativo" || filters?.status === "Inativo") {
      queryBuilder = queryBuilder.eq("ATIVO", filters.status === "Ativo");
    }

    if (filters?.minPrice !== undefined && filters.minPrice.trim() !== "") {
      queryBuilder = queryBuilder.gte("PRECO", Number(filters.minPrice));
    }

    if (filters?.maxPrice !== undefined && filters.maxPrice.trim() !== "") {
      queryBuilder = queryBuilder.lte("PRECO", Number(filters.maxPrice));
    }

    if (
      filters?.minQuantity !== undefined &&
      filters.minQuantity.trim() !== ""
    ) {
      queryBuilder = queryBuilder.gte(
        "QUANTIDADE_ESTOQUE",
        Number(filters.minQuantity),
      );
    }

    if (
      filters?.maxQuantity !== undefined &&
      filters.maxQuantity.trim() !== ""
    ) {
      queryBuilder = queryBuilder.lte(
        "QUANTIDADE_ESTOQUE",
        Number(filters.maxQuantity),
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as RawProdutoRow[]).map((row) =>
      normalizeProduct(row),
    );
  },

  createProduct: async (payload: ProductPayload): Promise<Product> => {
    const validationError = validateProductPayload(payload, "add");
    if (validationError) {
      throw new Error(validationError);
    }

    const trimmedCode = payload.code.trim();
    const codeAlreadyExists = await productService.checkCodeExists(trimmedCode);
    if (codeAlreadyExists) {
      throw new Error("Já existe um produto cadastrado com este código.");
    }

    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .insert([
        {
          ID_PRODUTO: crypto.randomUUID(),
          NOME: payload.name.trim(),
          DESCRICAO: payload.description?.trim() ?? "",
          PRECO: Number(payload.price),
          QUANTIDADE_ESTOQUE: Number(payload.quantity),
          CODIGO: trimmedCode,
          ATIVO: payload.active,
        },
      ])
      .select(PRODUCT_COLUMNS)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeProduct(data as RawProdutoRow, payload.image);
  },

  updateProduct: async (
    id: string,
    payload: ProductPayload,
  ): Promise<Product> => {
    const validationError = validateProductPayload(payload, "edit");
    if (validationError) {
      throw new Error(validationError);
    }

    const trimmedCode = payload.code.trim();
    const codeAlreadyExists = await productService.checkCodeExists(
      trimmedCode,
      id,
    );
    if (codeAlreadyExists) {
      throw new Error("Já existe outro produto cadastrado com este código.");
    }

    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .update({
        NOME: payload.name.trim(),
        DESCRICAO: payload.description?.trim() ?? "",
        PRECO: Number(payload.price),
        ATIVO: payload.active,
      })
      .eq("ID_PRODUTO", id)
      .select(PRODUCT_COLUMNS)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeProduct(data as RawProdutoRow, payload.image);
  },

  deleteProduct: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(PRODUCTS_TABLE)
      .delete()
      .eq("ID_PRODUTO", id);

    if (error) {
      throw new Error(error.message);
    }
  },
};
