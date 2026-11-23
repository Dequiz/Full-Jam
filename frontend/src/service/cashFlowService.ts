import { supabase } from "../lib/supabase/supabaseclient.ts";

const TABLE = "Movimentacao_Financeira";
const COLUMNS =
  "ID_MOVIMENTACAO,ID_PEDIDO,TIPO,CATEGORIA,VALOR,DATA_MOVIMENTACAO,DESCRICAO";
const MANUAL_ORIGIN = "MANUAL";

export const TRANSACTION_CATEGORIES: Record<"Entrada" | "Saída", string[]> = {
  Entrada: ["Venda", "Outros"],
  Saída: ["Compra", "Fornecedor", "Despesa", "Outros"],
};

export type TransactionType = "Entrada" | "Saída";
type TransactionTypeDB = "ENTRADA" | "SAIDA";

export type Transaction = {
  id: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
  orderId: string | null;
};

export type SaveTransactionPayload = Omit<Transaction, "id" | "orderId">;

type TransactionRow = {
  ID_MOVIMENTACAO: string;
  ID_PEDIDO: string | null;
  TIPO: string;
  CATEGORIA: string;
  VALOR: number | string;
  DATA_MOVIMENTACAO: string;
  DESCRICAO: string | null;
};

const toDbType = (type: TransactionType): TransactionTypeDB =>
  type === "Entrada" ? "ENTRADA" : "SAIDA";

const fromDbType = (type: string): TransactionType =>
  type.toUpperCase() === "ENTRADA" ? "Entrada" : "Saída";

const toDbTimestamp = (date: string) => `${date}T12:00:00`;

const toDbCategory = (category: string) => category.toUpperCase();

const fromDbCategory = (category: string) =>
  category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

const mapRow = (row: TransactionRow): Transaction => ({
  id: row.ID_MOVIMENTACAO,
  description: row.DESCRICAO ?? "",
  category: fromDbCategory(row.CATEGORIA),
  type: fromDbType(row.TIPO),
  amount: Number(row.VALOR),
  date: row.DATA_MOVIMENTACAO.slice(0, 10),
  orderId: row.ID_PEDIDO ?? null,
});

const toDbFields = (payload: SaveTransactionPayload) => ({
  TIPO: toDbType(payload.type),
  CATEGORIA: toDbCategory(payload.category),
  VALOR: payload.amount,
  DATA_MOVIMENTACAO: toDbTimestamp(payload.date),
  DESCRICAO: payload.description,
});

export const validateTransactionPayload = (
  payload: SaveTransactionPayload,
): string | null => {
  if (!payload.description.trim()) {
    return "Informe uma descrição para a movimentação.";
  }
  if (!TRANSACTION_CATEGORIES[payload.type].includes(payload.category)) {
    return "Selecione uma categoria válida.";
  }
  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    return "Informe um valor maior que zero.";
  }
  if (!payload.date) {
    return "Informe a data da movimentação.";
  }
  return null;
};

export const cashFlowService = {
  async getTransactions(): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const pageSize = 500;
    let offset = 0;

    while (true) {
      const { data, error } = await supabase
        .from(TABLE)
        .select(COLUMNS)
        .order("DATA_MOVIMENTACAO", { ascending: false })
        .order("ID_MOVIMENTACAO", { ascending: true })
        .range(offset, offset + pageSize - 1);

      if (error) throw new Error(error.message);

      const rows = (data ?? []) as unknown as TransactionRow[];
      if (rows.length === 0) return transactions;

      transactions.push(...rows.map(mapRow));
      offset += rows.length;
    }
  },

  async createTransaction(payload: SaveTransactionPayload): Promise<void> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const { error } = await supabase.from(TABLE).insert({
      ...toDbFields(payload),
      ID_USUARIO: user.id,
      ORIGEM: MANUAL_ORIGIN,
    });

    if (error) throw new Error(error.message);
  },

  async updateTransaction(
    id: string,
    payload: SaveTransactionPayload,
  ): Promise<void> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(toDbFields(payload))
      .eq("ID_MOVIMENTACAO", id)
      .select("ID_MOVIMENTACAO");

    if (error) throw new Error(error.message);
    // Com RLS, um update bloqueado não gera erro: só afeta 0 linhas.
    if (!data || data.length === 0) {
      throw new Error(
        "Não foi possível atualizar a movimentação (sem permissão ou registro inexistente).",
      );
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    const { data, error } = await supabase
      .from(TABLE)
      .delete()
      .eq("ID_MOVIMENTACAO", id)
      .select("ID_MOVIMENTACAO");

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      throw new Error(
        "Não foi possível excluir a movimentação (sem permissão ou registro inexistente).",
      );
    }
  },
};
