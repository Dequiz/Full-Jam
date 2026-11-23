import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";

import NavBar from "../../navbar/NavBar.tsx";
import type { RouteContext } from "../../../routes/ProtectedRoute.tsx";
import DeleteModal, { DeleteItemCard } from "../../../core/DeleteModal.tsx";
import {
  getPeriodRange,
  isInRange,
  periodOptions,
  type Period,
} from "../../../core/Period.ts";
import {
  cashFlowService,
  validateTransactionPayload,
  TRANSACTION_CATEGORIES,
  type SaveTransactionPayload,
  type Transaction,
} from "../../../service/cashFlowService.ts";

import CashFlowChart from "../components/CashFlowChart";
import SummaryCard from "../components/SummaryCard";
import TransactionForm from "../components/TransactionForm";
import TransactionHistory from "../components/TransactionHistory";
import { dateLabel, money } from "../components/cashFlowFormat.ts";

const today = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
};

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const emptyDraft: SaveTransactionPayload = {
  description: "",
  category: TRANSACTION_CATEGORIES.Entrada[0],
  type: "Entrada",
  amount: 0,
  date: today(),
};

const primaryButton =
  "inline-flex h-11 items-center justify-center rounded-[10px] bg-accent-color px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

export default function CashFlow() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period | "day">("day");
  const [closingDate, setClosingDate] = useState(today);
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
        period === "day" ? "month" : period,
        transactions.map((item) => item.date),
      ),
    [period, transactions],
  );

  const periodTransactions = useMemo(
    () =>
      transactions.filter((item) =>
        period === "day"
          ? item.date === closingDate
          : isInRange(item.date, range),
      ),
    [transactions, period, closingDate, range],
  );

  const totals = useMemo(
    () =>
      periodTransactions.reduce(
        (acc, item) => {
          const cents = Math.round(item.amount * 100);

          if (item.type === "Entrada") {
            acc.income += cents;
          } else {
            acc.expenses += cents;
          }

          return acc;
        },
        { income: 0, expenses: 0 },
      ),
    [periodTransactions],
  );

  const balance = (totals.income - totals.expenses) / 100;

  const unavailable =
    isLoading || Boolean(loadError) || (period === "day" && !closingDate);

  const periodLabel =
    periodOptions.find((option) => option.value === period)?.label ?? "";
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

      await fetchTransactions();
      closeForm();
      toast.success("Registro salvo com sucesso!");
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível salvar o registro."));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
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
      setTransactions((previous) =>
        previous.filter((item) => item.id !== deletingId),
      );
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

  return (
    <div className="flex min-h-screen bg-slate-50 text-[#1f2937]">
      <NavBar option="CASHFLOW" />

      <main className="min-w-0 flex-1 px-8 py-10 max-xl:px-6 max-md:px-4">
        <div className="mx-auto max-w-[1440px]">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col items-start gap-2.5">
              <div className="rounded-2xl p-2.5 shadow-[0_0_4px_#00000040]">
                <h1 className="text-4xl font-bold text-black">
                  Fluxo de Caixa
                </h1>
              </div>
              <p className="text-secondary-text mt-2 text-sm">
                Acompanhe as entradas, saídas e o resultado financeiro.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {period === "day" && (
                <label className="text-secondary-text flex items-center gap-2 text-xs">
                  Data do fechamento
                  <input
                    type="date"
                    value={closingDate}
                    onChange={(event) => setClosingDate(event.target.value)}
                    className="border-input-stroke h-11 rounded-lg border bg-white px-3"
                  />
                </label>
              )}
              <label className="text-secondary-text flex items-center gap-2 text-xs">
                Período
                <select
                  aria-label="Filtrar período da página"
                  value={period}
                  onChange={(event) =>
                    setPeriod(event.target.value as Period | "day")
                  }
                  className="border-input-stroke focus:border-accent-color h-11 rounded-[10px] border bg-white px-3 text-sm text-[#1f2937] outline-none"
                >
                  <option value="day">Fechamento diário</option>

                  {periodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={openNew} className={primaryButton}>
                <span className="mr-2 text-lg">＋</span> Nova movimentação
              </button>
            </div>
          </header>

          {isOwner && (
            <>
              <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryCard
                  title={
                    period === "day" ? "Saldo final do dia" : "Saldo do período"
                  }
                  value={unavailable ? null : balance}
                  detail="Entradas menos saídas"
                />

                <SummaryCard
                  title="Total de entradas"
                  value={unavailable ? null : totals.income / 100}
                  detail="Receitas registradas"
                />

                <SummaryCard
                  title="Total de saídas"
                  value={unavailable ? null : totals.expenses / 100}
                  detail="Despesas registradas"
                />
              </section>

              {period !== "day" && (
                <CashFlowChart
                  periodTransactions={periodTransactions}
                  range={range}
                  periodLabel={periodLabel}
                  isLoading={isLoading}
                  loadError={loadError}
                  onRetry={retryFetch}
                  onNew={openNew}
                />
              )}
            </>
          )}

          <TransactionHistory
            periodTransactions={periodTransactions}
            isOwner={isOwner}
            isLoading={isLoading}
            loadError={loadError}
            onRetry={retryFetch}
            onNew={openNew}
            onEdit={openEdit}
            onDelete={setDeletingId}
          />
        </div>
      </main>

      {formOpen && (
        <TransactionForm
          draft={draft}
          onChange={setDraft}
          isEditing={Boolean(editingId)}
          isSubmitting={isSubmitting}
          formError={formError}
          onClose={closeForm}
          onSave={saveTransaction}
        />
      )}

      {deletingId && (
        <DeleteModal
          title="Excluir movimentação?"
          description="Você está prestes a remover um registro do histórico do fluxo de caixa."
          warning="Essa ação removerá o lançamento do histórico e atualizará os totais financeiros. Não é possível desfazê-la"
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
