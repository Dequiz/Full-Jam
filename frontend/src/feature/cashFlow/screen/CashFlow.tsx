import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { PulseLoader } from "react-spinners";
import NavBar from "../../navbar/NavBar.tsx";
import { useOutletContext } from "react-router-dom";
import type { RouteContext } from "../../../routes/ProtectedRoute.tsx";
import EditButton from "../../../core/EditButton.tsx";
import DeleteButton from "../../../core/DeleteButton.tsx";
import DeleteModal, { DeleteItemCard } from "../../../core/DeleteModal.tsx";
import { toast } from "sonner";
import {
  cashFlowService,
  validateTransactionPayload,
  type SaveTransactionPayload,
  TRANSACTION_CATEGORIES,
  type Transaction,
  type TransactionType,
} from "../../../service/cashFlowService.ts";
import {
  buildBuckets,
  getPeriodRange,
  isInRange,
  periodOptions,
  type Period,
} from "../../../core/Period.ts";

const today = () => new Date().toISOString().slice(0, 10);
const money = (value: number | undefined) =>
  value != undefined
    ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "";
const dateLabel = (value: string | undefined) =>
  value != undefined
    ? new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");
const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const emptyDraft: SaveTransactionPayload = {
  description: "",
  category: TRANSACTION_CATEGORIES.Entrada[0],
  type: "Entrada",
  amount: 0,
  date: today(),
};

type ChartBucket = {
  key: string;
  label: string;
  income: number;
  expenses: number;
};

const primaryButton =
  "inline-flex h-11 items-center justify-center rounded-[10px] bg-accent-color px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
  "inline-flex h-10 items-center justify-center rounded-[9px] border border-input-stroke bg-white px-4 text-sm font-semibold text-accent-color transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";
const fieldClass =
  "mt-1 h-11 w-full rounded-[9px] border border-input-stroke bg-white px-3 text-sm text-[#1f2937] outline-none transition focus:border-accent-color focus:ring-2 focus:ring-blue-100";

export default function CashFlow() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("month");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SaveTransactionPayload>(emptyDraft);
  const [formError, setFormError] = useState("");

  const context = useOutletContext<RouteContext | undefined>();
  const isOwner = context?.role === "PROPRIETARIO";

  const fetchTransactions = useCallback(async () => {
    try {
      setTransactions(await cashFlowService.getTransactions());
      setLoadError(null);
    } catch (error) {
      setLoadError(
        errorMessage(error, "Não foi possível carregar as movimentações."),
      );
      toast.error("Erro ao consultar movimentações no banco de dados.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  const retryFetch = () => {
    setIsLoading(true);
    setLoadError(null);
    void fetchTransactions();
  };

  const range = useMemo(
    () =>
      getPeriodRange(
        period,
        transactions.map((item) => item.date),
      ),
    [period, transactions],
  );

  const periodTransactions = useMemo(
    () => transactions.filter((item) => isInRange(item.date, range)),
    [transactions, range],
  );

  const filtered = useMemo(
    () =>
      periodTransactions
        .filter((item) => {
          const inType = typeFilter === "Todos" || item.type === typeFilter;
          const inSearch = `${item.description} ${item.category}`
            .toLocaleLowerCase("pt-BR")
            .includes(search.toLocaleLowerCase("pt-BR"));
          return inType && inSearch;
        })
        .sort(
          (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
        ),
    [periodTransactions, typeFilter, search],
  );

  const totals = useMemo(
    () =>
      periodTransactions.reduce(
        (acc, item) => {
          if (item.type === "Entrada") acc.income += item.amount;
          else acc.expenses += item.amount;
          return acc;
        },
        { income: 0, expenses: 0 },
      ),
    [periodTransactions],
  );
  const balance = totals.income - totals.expenses;

  const transactionToDelete = transactions.find(
    (item) => item.id === deletingId,
  );

  const openNew = () => {
    setEditingId(null);
    setDraft({ ...emptyDraft, date: today() });
    setFormError("");
    setFormOpen(true);
  };
  const openEdit = (item: Transaction) => {
    setEditingId(item.id);
    setDraft({
      description: item.description,
      category: item.category,
      type: item.type,
      amount: item.amount,
      date: item.date,
    });
    setFormError("");
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setFormError("");
  };

  const saveTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const normalized: SaveTransactionPayload = {
      ...draft,
      description: draft.description.trim(),
      amount: Number(draft.amount),
    };

    const validationError = validateTransactionPayload(normalized);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await cashFlowService.updateTransaction(editingId, normalized);
      } else {
        await cashFlowService.createTransaction(normalized);
      }
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível salvar o registro."));
      console.error(error);
      setIsSubmitting(false);
      return;
    }

    await fetchTransactions();
    setIsSubmitting(false);
    closeForm();
    toast.success("Registro salvo com sucesso!");
  };

  const cancelOperation = () => {
    if (isSubmitting) return;
    setDeletingId(null);
  };

  const removeTransaction = async () => {
    if (!deletingId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await cashFlowService.deleteTransaction(deletingId);
      setTransactions((prev) => prev.filter((item) => item.id !== deletingId));
      setDeletingId(null);
    } catch (error) {
      toast.error(
        errorMessage(error, "Não foi possível excluir a movimentação."),
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDaily = range.start === range.end;
  const bucketWidth = isDaily ? 36 : 64;

  const chartData = useMemo<ChartBucket[]>(() => {
    const buckets: ChartBucket[] = buildBuckets(range).map((bucket) => ({
      ...bucket,
      income: 0,
      expenses: 0,
    }));

    for (const bucket of buckets) {
      for (const item of periodTransactions) {
        if (!item.date.startsWith(bucket.key)) continue;
        if (item.type === "Entrada") bucket.income += item.amount;
        else bucket.expenses += item.amount;
      }
    }

    return buckets;
  }, [range, periodTransactions]);

  const chartMax = Math.max(
    1,
    ...chartData.flatMap((bucket) => [bucket.income, bucket.expenses]),
  );

  const chartIsEmpty = chartData.every(
    (bucket) => bucket.income === 0 && bucket.expenses === 0,
  );

  const periodLabel =
    periodOptions.find((option) => option.value === period)?.label ?? "";

  // Só o proprietário edita e exclui, então só ele vê a coluna de ações.
  const tableHeadings = [
    "Descrição",
    "Categoria",
    "Data",
    "Tipo",
    "Valor",
    ...(isOwner ? ["Ações"] : []),
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-[#1f2937]">
      <NavBar option="CASHFLOW" />
      <main className="min-w-0 flex-1 px-8 py-10 max-xl:px-6 max-md:px-4">
        <div className="mx-auto max-w-[1440px]">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className={"flex flex-col items-start gap-2.5"}>
              <div className={"rounded-2xl p-2.5 shadow-[0_0_4px_#00000040]"}>
                <h1 className={"text-4xl font-bold text-black"}>
                  Fluxo de Caixa
                </h1>
              </div>
              <p className="text-secondary-text mt-2 text-sm">
                Acompanhe as entradas, saídas e o resultado financeiro.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-secondary-text flex items-center gap-2 text-xs">
                Período
                <select
                  aria-label="Filtrar período da página"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as Period)}
                  className="border-input-stroke focus:border-accent-color h-11 rounded-[10px] border bg-white px-3 text-sm text-[#1f2937] outline-none"
                >
                  {periodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button onClick={openNew} className={primaryButton}>
                <span className="mr-2 text-lg">＋</span> Nova movimentação
              </button>
            </div>
          </header>

          {isOwner && (
            <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SummaryCard
                title="Saldo do período"
                value={isLoading ? "—" : money(balance)}
                detail="Entradas menos saídas"
              />
              <SummaryCard
                title="Total de entradas"
                value={isLoading ? "—" : money(totals.income)}
                detail="Receitas registradas"
              />
              <SummaryCard
                title="Total de saídas"
                value={isLoading ? "—" : money(totals.expenses)}
                detail="Despesas registradas"
              />
            </section>
          )}

          {isOwner && (
            <section className="border-input-stroke mb-7 rounded-[15px] border bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Movimentação financeira</h2>
                  <p className="text-secondary-text mt-1 text-xs">
                    {isDaily ? "Comparativo diário" : "Comparativo mensal"}.{" "}
                    {periodLabel.toLocaleLowerCase("pt-BR")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-secondary-text flex flex-wrap items-center gap-4 text-xs">
                    <span className="flex items-center gap-2">
                      <i className="size-2.5 rounded-full bg-emerald-500" />{" "}
                      Entradas
                    </span>
                    <span className="flex items-center gap-2">
                      <i className="size-2.5 rounded-full bg-rose-400" /> Saídas
                    </span>
                  </div>
                </div>
              </div>
              {isLoading ? (
                <LoadingState />
              ) : loadError ? (
                <LoadErrorState message={loadError} onRetry={retryFetch} />
              ) : chartIsEmpty ? (
                <div className="px-5 py-14 text-center">
                  <div className="text-secondary-text mx-auto mb-3 grid size-12 place-items-center rounded-full bg-slate-100 text-xl">
                    R$
                  </div>
                  <p className="font-semibold">
                    Nenhuma movimentação encontrada
                  </p>
                  <p className="text-secondary-text mt-1 text-xs">
                    Tente alterar os filtros ou cadastre uma nova movimentação.
                  </p>
                  <button
                    onClick={openNew}
                    className="text-accent-color mt-4 text-sm font-semibold"
                  >
                    Adicionar movimentação
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border-b border-slate-100 pb-2">
                  <div
                    className="flex h-[190px] min-w-full gap-3"
                    style={{
                      minWidth: `${chartData.length * (bucketWidth + 12)}px`,
                      justifyContent: "center",
                    }}
                  >
                    {chartData.map((bucket) => (
                      <div
                        key={bucket.key}
                        className="flex w-[64px] shrink-0 flex-col items-center justify-end gap-2"
                        style={{ width: `${bucketWidth}px` }}
                      >
                        <div className="flex h-[155px] w-full items-end justify-center gap-1.5">
                          {bucket.income > 0 && (
                            <div
                              title={`Entradas: ${money(bucket.income)}`}
                              className="w-[min(25px,40%)] rounded-t-md bg-emerald-500 transition-all"
                              style={{
                                height: `${Math.max(4, (bucket.income / chartMax) * 100)}%`,
                              }}
                            />
                          )}
                          {bucket.expenses > 0 && (
                            <div
                              title={`Saídas: ${money(bucket.expenses)}`}
                              className="w-[min(25px,40%)] rounded-t-md bg-rose-400 transition-all"
                              style={{
                                height: `${Math.max(4, (bucket.expenses / chartMax) * 100)}%`,
                              }}
                            />
                          )}
                        </div>
                        <span className="text-secondary-text text-[11px] capitalize">
                          {bucket.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="border-input-stroke overflow-hidden rounded-[15px] border bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7ebf3] p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-bold">
                  Histórico de movimentações
                </h2>
                <p className="text-secondary-text mt-1 text-xs">
                  {filtered.length}{" "}
                  {filtered.length === 1
                    ? "lançamento encontrado"
                    : "lançamentos encontrados"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label="Filtrar tipo"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border-input-stroke focus:border-accent-color h-10 rounded-lg border bg-white px-3 text-xs outline-none"
                >
                  <option>Todos</option>
                  <option>Entrada</option>
                  <option>Saída</option>
                </select>
              </div>
            </div>
            <div className="border-b border-[#e7ebf3] p-4 sm:px-6">
              <label className="border-input-stroke text-secondary-text flex h-10 max-w-[420px] items-center gap-2 rounded-lg border px-3">
                <span className="text-lg">⌕</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por descrição ou categoria"
                  className="placeholder:text-secondary-text w-full bg-transparent text-xs text-[#1f2937] outline-none"
                />
              </label>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <LoadingState />
              ) : loadError ? (
                <LoadErrorState message={loadError} onRetry={retryFetch} />
              ) : (
                <>
                  <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                    <thead className="bg-accent-color text-xs font-semibold text-white">
                      <tr>
                        {tableHeadings.map((heading) => (
                          <th key={heading} className="px-5 py-4">
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-[#e7ebf3] transition hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4 font-semibold">
                            {item.description}
                          </td>
                          <td className="text-secondary-text px-5 py-4">
                            {item.category}
                          </td>
                          <td className="text-secondary-text px-5 py-4">
                            {dateLabel(item.date)}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${item.type === "Entrada" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td
                            className={`px-5 py-4 font-semibold tabular-nums ${item.type === "Entrada" ? "text-emerald-700" : "text-rose-600"}`}
                          >
                            {item.type === "Entrada" ? "+ " : "− "}
                            {money(item.amount)}
                          </td>
                          {isOwner && (
                            <td className="px-5 py-4">
                              {item.orderId ? (
                                <span className="text-secondary-text text-xs">
                                  Gerada pelo pedido
                                </span>
                              ) : (
                                <div className="flex gap-2">
                                  <EditButton
                                    objectToEdit={{
                                      id: item.id,
                                    }}
                                    onEdit={() => openEdit(item)}
                                  />
                                  <DeleteButton
                                    objectToDelete={{
                                      id: item.id,
                                    }}
                                    onDelete={() => setDeletingId(item.id)}
                                  />
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="px-5 py-14 text-center">
                      <div className="text-secondary-text mx-auto mb-3 grid size-12 place-items-center rounded-full bg-slate-100 text-xl">
                        R$
                      </div>
                      <p className="font-semibold">
                        Nenhuma movimentação encontrada
                      </p>
                      <p className="text-secondary-text mt-1 text-xs">
                        Tente alterar os filtros ou cadastre uma nova
                        movimentação.
                      </p>
                      <button
                        onClick={openNew}
                        className="text-accent-color mt-4 text-sm font-semibold"
                      >
                        Adicionar movimentação
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      {formOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) closeForm();
          }}
        >
          <form
            onSubmit={(e) => void saveTransaction(e)}
            className="my-auto w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId ? "Editar movimentação" : "Nova movimentação"}
                </h2>
                <p className="text-secondary-text mt-1 text-xs">
                  Informe os dados do lançamento financeiro.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                aria-label="Fechar"
                className="text-secondary-text grid size-8 place-items-center rounded-lg text-xl hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <label className="text-secondary-text text-xs font-semibold sm:col-span-2">
                Descrição
                <input
                  autoFocus
                  required
                  maxLength={100}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  placeholder="Ex.: Venda de produtos"
                  className={fieldClass}
                />
              </label>
              <label className="text-secondary-text text-xs font-semibold">
                Tipo
                <select
                  value={draft.type}
                  onChange={(e) => {
                    const type = e.target.value as TransactionType;
                    setDraft({
                      ...draft,
                      type,
                      category: TRANSACTION_CATEGORIES[type][0],
                    });
                  }}
                  className={fieldClass}
                >
                  <option>Entrada</option>
                  <option>Saída</option>
                </select>
              </label>
              <label className="text-secondary-text text-xs font-semibold">
                Categoria
                <select
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({ ...draft, category: e.target.value })
                  }
                  className={fieldClass}
                >
                  {TRANSACTION_CATEGORIES[draft.type].map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="text-secondary-text text-xs font-semibold">
                Valor (R$)
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={draft.amount || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, amount: Number(e.target.value) })
                  }
                  placeholder="0,00"
                  className={fieldClass}
                />
              </label>
              <label className="text-secondary-text text-xs font-semibold">
                Data
                <input
                  required
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  className={fieldClass}
                />
              </label>
              {formError && (
                <p
                  role="alert"
                  className="text-xs font-medium text-rose-600 sm:col-span-2"
                >
                  {formError}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                className={secondaryButton}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={primaryButton}
              >
                {isSubmitting ? (
                  <PulseLoader color="#ffffff" size={8} margin={2} />
                ) : editingId ? (
                  "Salvar alterações"
                ) : (
                  "Adicionar lançamento"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {deletingId && (
        <DeleteModal
          title="Excluir movimentação?"
          description={
            "Você está prestes a remover um registro do histórico do fluxo de caixa."
          }
          warning={
            "Essa ação removerá o lançamento do histórico e atualizará os totais financeiros. Não é possível desfazê-la"
          }
          confirmLabel="Excluir movimentação"
          onCancel={cancelOperation}
          onConfirm={() => void removeTransaction()}
        >
          <DeleteItemCard
            title={transactionToDelete?.description}
            subtitle={`${transactionToDelete?.category} • ${transactionToDelete?.type}`}
            details={dateLabel(transactionToDelete?.date)}
            aside={money(transactionToDelete?.amount)}
          />
        </DeleteModal>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10">
      <PulseLoader color="#395CEB" size={10} />
      <p className="text-secondary-text text-[13px]">
        Carregando movimentações...
      </p>
    </div>
  );
}

function LoadErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-destructive-color text-[13px]">
        Não foi possível carregar as movimentações ({message}).
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="text-accent-color cursor-pointer text-[13px] font-semibold underline"
      >
        Tentar novamente
      </button>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  const rawValue = () => {
    const numberCleaned = value.replace(/[^-\d,]/g, "").replace(",", ".");
    console.log(numberCleaned);
    return Number(numberCleaned);
  };

  return (
    <article className="border-input-stroke rounded-[15px] border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-secondary-text text-sm font-medium">{title}</p>
      </div>
      <p
        className={`mt-4 text-[26px] font-bold tracking-tight ${rawValue() >= 0 ? "text-[#202938]" : "text-destructive-color"} max-sm:text-[22px]`}
      >
        {value}
      </p>
      <p className="text-secondary-text mt-1 text-xs">{detail}</p>
    </article>
  );
}
